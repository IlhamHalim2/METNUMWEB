function normalizeForDerivative(expr) {
  return expr
    .replace(/\bln\b/g, 'log')
    .replace(/\bPI\b/g, 'pi')
    .replace(/\bpi\b/g, 'pi');
}

function autoFillDerivative() {
  const fxInput = document.getElementById('n-fx');
  const dfxInput = document.getElementById('n-dfx');
  const expr = fxInput.value.trim();

  if (!expr) {
    dfxInput.value = '';
    return;
  }

  try {
    const normalized = normalizeForDerivative(expr);
    const derivative = window.math.derivative(window.math.parse(normalized), 'x');
    dfxInput.value = window.math.simplify(derivative).toString();
  } catch (e) {
    dfxInput.value = '';
  }
}

window.addEventListener('DOMContentLoaded', autoFillDerivative);
document.getElementById('n-fx').addEventListener('input', autoFillDerivative);

// ── Newton-Raphson ────────────────────────────────────────
function runNewton() {
  clearResult('newton');
  let f, df;

  try { f  = parseFunc(document.getElementById('n-fx').value); }
  catch (e) { return showErr('newton', 'Fungsi f(x) tidak valid: ' + e.message); }

  try { df = parseFunc(document.getElementById('n-dfx').value); }
  catch (e) { return showErr('newton', "Fungsi f'(x) tidak valid: " + e.message); }

  let x        = parseFloat(document.getElementById('n-x0').value);
  const tol    = parseFloat(document.getElementById('n-tol').value)    || 1e-5;
  const maxIter = parseInt(document.getElementById('n-maxiter').value) || 50;

  if (isNaN(x)) return showErr('newton', 'Nilai x₀ tidak valid');

  const rows = [], pts = [{ x }];
  let converged = false;

  for (let i = 1; i <= maxIter; i++) {
    let fx, dfx;
    try { fx = f(x); dfx = df(x); }
    catch (e) { showErr('newton', 'Error evaluasi pada iterasi ' + i + ': ' + e.message); break; }

    if (!isFinite(fx) || !isFinite(dfx)) {
      showErr('newton', 'Nilai tidak terhingga pada iterasi ' + i + ' (x=' + x.toFixed(6) + ')');
      break;
    }
    if (Math.abs(dfx) < 1e-14) {
      showErr('newton', "f'(x) ≈ 0 pada iterasi ke-" + i + ". Metode gagal (pembagian oleh nol).");
      break;
    }

    const xnew = x - fx / dfx;
    const err  = Math.abs(xnew - x);
    rows.push({ iter: i, x, fx, dfx, xnew, err });
    pts.push({ x: xnew });
    x = xnew;
    if (err < tol) { converged = true; break; }
  }

  if (!rows.length) return;
  const last = rows[rows.length - 1];
  let ff;
  try { ff = f(last.xnew); } catch (e) { ff = NaN; }
  renderSummary('summary-newton', last.xnew, ff, rows.length, converged);

  document.getElementById('tbody-newton').innerHTML = rows.map((r, i) => `
    <tr class="${i === rows.length - 1 && converged ? 'converged' : ''}">
      <td>${r.iter}</td>
      <td>${fmt(r.x)}</td>
      <td>${fmt(r.fx)}</td>
      <td>${fmt(r.dfx)}</td>
      <td>${fmt(r.xnew)}</td>
      <td>${r.err.toExponential(4)}</td>
    </tr>`).join('');

  document.getElementById('res-newton').classList.add('show');
  setTimeout(() => drawChart('chart-newton', f, pts), 60);
}
