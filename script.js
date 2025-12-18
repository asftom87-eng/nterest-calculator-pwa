function clc() {
    const p = parseFloat(document.getElementById('p').value) || 0;
    const l = parseFloat(document.getElementById('l').value) || 0;
    const r1 = parseFloat(document.getElementById('r1').value) || 0;
    const r2 = parseFloat(document.getElementById('r2').value) || 0;
    const type = document.getElementById('t').value;
    const sd = document.getElementById('sd').value;
    const ed = document.getElementById('ed').value;

    if (!sd || !ed) return;
    const start = new Date(sd);
    const end = new Date(ed);
    const d = Math.round((end - start) / 86400000);
    document.getElementById('days').innerText = d > 0 ? d : 0;
    
    if (d <= 0) {
        show(0, 0, p);
        return;
    }

    const ph = Math.min(p, l);
    const pg = Math.max(0, p - l);
    let ih = 0, ig = 0;

    if (type === 's') {
        ih = ph * (r1 / 100) * (d / 365.25);
        ig = pg * (r2 / 100) * (d / 365.25);
    } else {
        ih = cmp(ph, r1 / 100, start, end);
        ig = cmp(pg, r2 / 100, start, end);
    }

    const total = ih + ig;
    const mon = (d < 32) ? total : (total / (d / 30.44));
    show(mon, total, p + total);
}

function cmp(p, r, s, e) {
    let cp = p, ti = 0, cs = new Date(s.getTime());
    while (cs < e) {
        let n = new Date(cs.getFullYear(), cs.getMonth(), 21);
        if (cs.getDate() >= 21) n.setMonth(n.getMonth() + 1);
        let pe = (e < n) ? e : n;
        let days = Math.round((pe - cs) / 86400000);
        if (days <= 0) break;
        let i = cp * r * (days / 365.25);
        ti += i;
        if (pe.getDate() === 21) cp += i;
        cs = pe;
    }
    return ti;
}

function show(m, t, f) {
    const fms = (v) => "NT$ " + v.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    document.getElementById('resM').innerText = fms(m);
    document.getElementById('resT').innerText = fms(t);
    document.getElementById('resF').innerText = fms(f);
}

document.addEventListener('DOMContentLoaded', () => {
    const n = new Date();
    document.getElementById('sd').value = n.toISOString().slice(0, 10);
    n.setMonth(n.getMonth() + 1);
    document.getElementById('ed').value = n.toISOString().slice(0, 10);
    clc();
});
