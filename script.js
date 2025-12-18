function calculate() {
    // 1. 取得數值
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const limit = parseFloat(document.getElementById('limit').value) || 0;
    const prefRate = parseFloat(document.getElementById('prefRate').value) || 0;
    const genRate = parseFloat(document.getElementById('genRate').value) || 0;
    const type = document.getElementById('compType').value;
    
    const sDateVal = document.getElementById('startDate').value;
    const eDateVal = document.getElementById('endDate').value;
    
    if (!sDateVal || !eDateVal) return;

    const start = new Date(sDateVal);
    const end = new Date(eDateVal);
    const days = Math.round((end - start) / (1000 * 60000 * 60 * 24));
    
    document.getElementById('dayCount').textContent = days > 0 ? days : 0;

    if (days <= 0 || principal <= 0) {
        show(0, 0, principal);
        return;
    }

    // 2. 分層
    const pHigh = Math.min(principal, limit);
    const pGen = Math.max(0, principal - limit);
    let iHigh = 0, iGen = 0;

    // 3. 計算
    if (type === 'simple') {
        iHigh = pHigh * (prefRate / 100) * (days / 365.25);
        iGen = pGen * (genRate / 100) * (days / 365.25);
    } else {
        iHigh = calcComp(pHigh, prefRate / 100, start, end);
        iGen = calcComp(pGen, genRate / 100, start, end);
    }

    const totalI = iHigh + iGen;
    // 如果小於32天(約一個月)，月息直接等於總息，避免使用者困惑
    const monthlyI = (days < 32) ? totalI : (totalI / (days / 30.4375));

    show(monthlyI, totalI, principal + totalI);
}

function calcComp(p, r, start, end) {
    let curP = p, totalI = 0, curS = new Date(start.getTime());
    while (curS < end) {
        let n21 = new Date(curS.getFullYear(), curS.getMonth(), 21);
        if (curS.getDate() >= 21) n21.setMonth(n21.getMonth() + 1);
        let pEnd = (end < n21) ? end : n21;
        let d = Math.round((pEnd - curS) / (1000 * 3600 * 24));
        if (d <= 0) break;
        let i = curP * r * (d / 365.25);
        totalI += i;
        if (pEnd.getDate() === 21) curP += i; // 只有在21號當天才把利息加入本金
        curS = pEnd;
    }
    return totalI;
}

function show(m, t, f) {
    const fms = (v) => "NT$ " + v.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('resMonthly').textContent = fms(m);
    document.getElementById('resTotal').textContent = fms(t);
    document.getElementById('resFuture').textContent = fms(f);
}

// 預設日期設定
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('startDate').value = today.toISOString().slice(0, 10);
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    document.getElementById('endDate').value = next.toISOString().slice(0, 10);
    calculate();
});