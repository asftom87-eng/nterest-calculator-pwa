// ====== 活存利率分層計算核心邏輯 (最終純手動模式 - 複利精確優化) ======

// (calculateDays, calculateSimpleInterest, calculateMonthlyCompoundInterest, calculatePortionInterest 函式保持不變，略過詳情)

/**
 * 計算日期差 (天數與年數比例)
 */
function calculateDays() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) return { days: 0, years: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
        document.getElementById('displayDays').textContent = "結束日須晚於起始日";
        document.getElementById('displayYears').textContent = "0";
        return { days: 0, years: 0 };
    }

    const timeDifference = end.getTime() - start.getTime();
    const days = Math.round(timeDifference / (1000 * 3600 * 24));
    // 活存利息通常以 365.25 天為分母
    const years = days / 365.25; 

    document.getElementById('displayDays').textContent = days;
    document.getElementById('displayYears').textContent = years.toFixed(4);

    return { days, years };
}

/**
 * 計算單一區段的利息 (單利公式: I = P * r * t)
 * @param {number} principal - 本金 (P)
 * @param {number} rate - 年利率 (%)
 * @param {number} yearsFraction - 年數比例 (t)
 * @returns {number} 利息金額
 */
function calculateSimpleInterest(principal, rate, yearsFraction) {
    const annualRate = rate / 100; // r
    return principal * annualRate * yearsFraction;
}


/**
 * 模擬「每月 21 號結算滾入本金」的複利計算 (優化版本)。
 * 核心思路：迭代每一個結算週期，使用單利公式計算該週期利息，並在結算日滾入本金。
 * @param {number} principal - 初始本金
 * @param {number} annualRate - 年利率 (0.0X 形式)
 * @param {Date} startDate - 起始日期
 * @param {Date} endDate - 結束日期
 * @returns {number} 總利息金額
 */
function calculateMonthlyCompoundInterest(principal, annualRate, startDate, endDate) {
    let currentPrincipal = principal;
    let totalInterest = 0;
    let currentPeriodStart = new Date(startDate.getTime()); // 當前計息週期的起始日

    // 輔助函式：找到下一個結算日（每月 21 號）
    const findNextSettlementDate = (currentDate) => {
        let nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 21);
        
        // 如果當前日期已經在 21 號或之後，結算日應為下個月的 21 號
        if (currentDate.getDate() >= 21) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        // 如果計算出的下一個 21 號在起始日之前，則跳到更後面的日期 (防止迴圈錯誤)
        if (nextDate <= currentDate) {
             nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        return nextDate;
    };
    
    // --- 1. 處理起始日到第一個結算日的利息 ---
    
    // 找到第一個結算日
    let firstSettlementDate = findNextSettlementDate(currentPeriodStart);
    
    // 結算期結束日為 endDate 或 firstSettlementDate，取較早者
    let periodEnd = (endDate <= firstSettlementDate) ? endDate : firstSettlementDate;

    // 計算天數
    let timeDifference = periodEnd.getTime() - currentPeriodStart.getTime();
    let daysInPeriod = Math.round(timeDifference / (1000 * 3600 * 24));
    
    if (daysInPeriod > 0) {
        // 使用單利公式計算該段時間利息
        const interestInPeriod = principal * annualRate * (daysInPeriod / 365.25);
        totalInterest += interestInPeriod;
        
        // 如果結束日是結算日，則滾入本金
        if (periodEnd.getDate() === 21 && periodEnd.getTime() === endDate.getTime()) {
            currentPrincipal += interestInPeriod;
        }
        // 如果在結算日之前結束，則不會滾入本金，計算結束
        else if (periodEnd.getTime() === endDate.getTime()) {
            return totalInterest;
        }
    }
    
    // 將當前起始日推進到第一個結算日
    currentPeriodStart = firstSettlementDate;


    // --- 2. 循環處理所有完整的結算週期 (21號到下一個21號) ---
    while (currentPeriodStart < endDate) {
        // 找到下一個結算日
        let nextSettlementDate = findNextSettlementDate(currentPeriodStart);
        
        // 結算期結束日為 endDate 或 nextSettlementDate，取較早者
        periodEnd = (endDate <= nextSettlementDate) ? endDate : nextSettlementDate;

        // 計算本週期天數
        timeDifference = periodEnd.getTime() - currentPeriodStart.getTime();
        daysInPeriod = Math.round(timeDifference / (1000 * 3600 * 24));
        
        if (daysInPeriod <= 0) break; 
        
        // 計算並累積利息 (使用滾入本金後的 currentPrincipal)
        const interestInPeriod = currentPrincipal * annualRate * (daysInPeriod / 365.25);
        totalInterest += interestInPeriod;
        
        // 如果 periodEnd 是下一個結算日 (21號)，則執行複利滾入
        if (periodEnd.getTime() === nextSettlementDate.getTime()) {
            currentPrincipal += interestInPeriod;
            currentPeriodStart = nextSettlementDate; // 將起始日推進到下一個 21 號
        } 
        // 如果在下一個結算日之前結束 (periodEnd == endDate)，則計算結束，不滾入本金
        else {
            break;
        }
    }

    return totalInterest;
}

/**
 * 計算單一區段的利息 (P * r * t 或月複利模擬)
 * @param {number} principal - 本金 (P)
 * @param {number} rate - 年利率 (%)
 * @param {number} yearsFraction - 年數比例 (t)
 * @param {string} compoundType - 計算方式 ('simple' 或 'monthly_compound')
 * @param {Date} startDate - 起始日期 (僅用於月複利)
 * @param {Date} endDate - 結束日期 (僅用於月複利)
 * @returns {number} 利息金額
 */
function calculatePortionInterest(principal, rate, yearsFraction, compoundType, startDate, endDate) {
    // 1. 單利模式：I = P * r * t
    if (compoundType === 'simple') {
        return calculateSimpleInterest(principal, rate, yearsFraction);
    } 
    
    // 2. 月複利模式：調用精確模擬函式
    else if (compoundType === 'monthly_compound') {
        return calculateMonthlyCompoundInterest(principal, rate / 100, startDate, endDate);
    }
    
    return 0; // 預防未定義的 compoundType
}

/**
 * 主計算函式：分層計息
 */
function calculateTieredInterest() {
    // 1. 取得所有輸入值和日期
    const principal = parseFloat(document.getElementById('principal').value);
    const compoundType = document.getElementById('compound').value;
    
    const limit = parseFloat(document.getElementById('limit').value);
    const preferentialRate = parseFloat(document.getElementById('preferentialRate').value);
    const generalRate = parseFloat(document.getElementById('generalRate').value);
    
    const { days, years: yearsFraction } = calculateDays(); 

    const startDateValue = document.getElementById('startDate').value;
    const endDateValue = document.getElementById('endDate').value;
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    
    const rateToUse = preferentialRate; 
    
    // 檢查輸入是否有效
    if (days <= 0 || isNaN(principal) || isNaN(limit) || isNaN(rateToUse) || isNaN(generalRate) || principal < 0 || limit < 0) {
        const formatCurrency = (amount) => '0.00';
        document.getElementById('totalInterest').textContent = `NT$ --`;
        document.getElementById('monthlyInterest').textContent = `NT$ --`;
        document.getElementById('futureValue').textContent = `NT$ --`;
        return;
    }

    // 2. 劃分本金 (分層計息邏輯)
    const principalHigh = Math.min(principal, limit); // 優惠高利限額內的部分
    const principalGeneral = Math.max(0, principal - limit); // 超過限額的部分
    
    // 3. 分別計算利息
    const interestHigh = calculatePortionInterest(principalHigh, rateToUse, yearsFraction, compoundType, startDate, endDate);
    const interestGeneral = calculatePortionInterest(principalGeneral, generalRate, yearsFraction, compoundType, startDate, endDate);

    const totalInterest = interestHigh + interestGeneral;
    const futureValue = principal + totalInterest;

    // 4. 計算：每月平均利息 (調整邏輯)
    let monthlyInterest;
    
    // 如果計算期在 32 天以下，我們將總利息視為「月利息」
    if (days < 32) {
        monthlyInterest = totalInterest;
    } else {
        // 否則，計算年化平均月利息
        const totalMonths = days / (365.25 / 12);
        monthlyInterest = totalInterest / totalMonths;
    }

    // 5. 格式化結果
    const formatCurrency = (amount) => amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // 6. 更新結果顯示區
    document.getElementById('principalHigh').textContent = `NT$ ${formatCurrency(principalHigh)}`;
    document.getElementById('rateHigh').textContent = `${rateToUse.toFixed(3)}%`;
    
    document.getElementById('principalGeneral').textContent = `NT$ ${formatCurrency(principalGeneral)}`;
    document.getElementById('rateGeneral').textContent = `${generalRate.toFixed(3)}%`;

    document.getElementById('monthlyInterest').textContent = `NT$ ${formatCurrency(monthlyInterest)}`;
    document.getElementById('totalInterest').textContent = `NT$ ${formatCurrency(totalInterest)}`;
    document.getElementById('futureValue').textContent = `NT$ ${formatCurrency(futureValue)}`;
}

// 頁面載入後執行 (保持不變)
document.addEventListener('DOMContentLoaded', () => {
    // 確保預設日期值為今天到一年後
    const now = new Date();
    document.getElementById('startDate').value = now.toISOString().slice(0, 10);
    
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    document.getElementById('endDate').value = oneYearLater.toISOString().slice(0, 10);
    
    // 綁定所有輸入框的事件
    document.getElementById('startDate').addEventListener('change', calculateTieredInterest);
    document.getElementById('endDate').addEventListener('change', calculateTieredInterest);
    document.getElementById('principal').addEventListener('input', calculateTieredInterest);
    document.getElementById('compound').addEventListener('change', calculateTieredInterest);
    
    document.getElementById('limit').addEventListener('input', calculateTieredInterest);
    document.getElementById('preferentialRate').addEventListener('input', calculateTieredInterest);
    document.getElementById('generalRate').addEventListener('input', calculateTieredInterest);

    calculateTieredInterest(); 
});