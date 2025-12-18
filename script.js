/**
 * 精確計算邏輯：日單利、月結算 (21日)
 */
function calculateDays() {
    const start = new Date(document.getElementById('startDate').value);
    const end = new Date(document.getElementById('endDate').value);
    if (isNaN(start) || isNaN(end) || start >= end) return { days: 0, years: 0 };
    const days = Math.round((end - start) / (1000 * 3600 * 24));
    return { days, years: days / 365.25 };
}

function calculateMonthlyCompoundInterest(principal, annualRate, startDate, endDate) {
    let currentPrincipal = principal;
    let totalInterest = 0;
    let currentStart = new Date(startDate.getTime());

    const getNext21 = (date) => {
        let next = new Date(date.getFullYear(), date.getMonth(), 21);
        if (date.getDate() >= 21) next.setMonth(next.getMonth() + 1);
        return next;
    };

    while (currentStart < endDate) {
        let nextSettlement = getNext21(currentStart);
        let periodEnd = (endDate < nextSettlement) ? endDate : nextSettlement;
        let days = Math.round((periodEnd - currentStart) / (1000 * 3600 * 24));
        
        if (days <= 0) break;
        let interest = currentPrincipal * annualRate * (days / 365.25);
        totalInterest += interest;
        
        if (periodEnd.getDate() === 21) currentPrincipal += interest;
        currentStart = periodEnd;
    }
    return totalInterest;
}

function calculateTieredInterest() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const limit = parseFloat(document.getElementById('limit').value) || 0;
    const prefRate = parseFloat(document.getElementById('preferentialRate').value) || 0;
    const genRate = parseFloat(document.getElementById('generalRate').value) || 0;
    const compoundType = document.getElementById('compound').value;
    const { days, years } = calculateDays();
    
    document.getElementById('displayDays').textContent = days;
    if (days <= 0) return;

    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    const pHigh = Math.min(principal, limit);
    const pGen = Math.max(0, principal - limit);
    let iHigh, iGen;

    if (compoundType === 'simple') {
        iHigh = pHigh * (prefRate / 100) * years;
        iGen = pGen * (genRate / 100) * years;
    } else {
        iHigh = calculateMonthlyCompoundInterest(pHigh, prefRate / 100, startDate, endDate);
        iGen = calculateMonthlyCompoundInterest(pGen, genRate / 100, startDate, endDate);
    }

    const totalI = iHigh + iGen;
    const mInterest = (days < 32) ? totalI : (totalI / (days / (365.25 / 12)));

    const fmt = (num) => "NT$ " + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById('monthlyInterest').textContent = fmt(mInterest);
    document.getElementById('totalInterest').textContent = fmt(totalI);
    document.getElementById('futureValue').textContent = fmt(principal + totalI);
}

// 初始化日期
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    document.getElementById('startDate').value = now.toISOString().slice(0, 10);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('endDate').value = nextMonth.toISOString().slice(0, 10);
    calculateTieredInterest();
});