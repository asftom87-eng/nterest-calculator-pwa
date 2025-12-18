// ====== 活存利率計算核心 (修正版) ======

function calculateDays() {
    const startVal = document.getElementById('startDate').value;
    const endVal = document.getElementById('endDate').value;
    if (!startVal || !endVal) return { days: 0, years: 0 };
    
    const start = new Date(startVal);
    const end = new Date(endVal);
    
    if (start >= end) return { days: 0, years: 0 };
    
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
    // 取得輸入值並強制轉為數字，防止異常字串導致 0.00
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const limit = parseFloat(document.getElementById('limit').value) || 0;
    const prefRate = parseFloat(document.getElementById('preferentialRate').value) || 0;
    const genRate = parseFloat(document.getElementById('generalRate').value) || 0;
    const compoundType = document.getElementById('compound').value;
    
    const { days, years } = calculateDays();
    const dayDisplay = document.getElementById('displayDays');
    if (dayDisplay) dayDisplay.textContent = days;

    if (days <= 0 || principal <= 0) {
        updateDisplay(0, 0, principal);
        return;
    }

    const startVal = document.getElementById('startDate').value;
    const endVal = document.getElementById('endDate').value;
    const startDate = new Date(startVal);
    const endDate = new Date(endVal);

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
    const mInterest = (days < 32) ? totalI : (totalI / (days / (30.4375))); // 使用平均月天數

    updateDisplay(mInterest, totalI, principal + totalI);
}

function updateDisplay(monthly, total, future) {
    const fmt = (num) => "NT$ " + (num || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById('monthlyInterest').textContent = fmt(monthly);
    document.getElementById('totalInterest').textContent = fmt(total);
    document.getElementById('futureValue').textContent = fmt(future);
}

// 初始化日期
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && !startDateInput.value) {
        startDateInput.value = now.toISOString().slice(0, 10);
    }
    if (endDateInput && !endDateInput.value) {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        endDateInput.value = nextMonth.toISOString().slice(0, 10);
    }
    calculateTieredInterest();
});