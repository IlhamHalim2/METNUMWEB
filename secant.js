// ── Metode Secant ─────────────────────────────────────────
function runSecant() {
  clearResult('secant');
  let f;
  try { f = parseFunc(document.getElementById('s-fx').value); }
  catch (e) { return showErr('secant', 'Fungsi f(x) tidak valid: ' + e.message); }

  let x0       = parseFloat(document.getElementById('s-x0').value);
  let x1       = parseFloat(document.getElementById('s-x1').value);
  const tol    = parseFloat(document.getElementById('s-tol').value)    || 1e-5;
  const maxIter = parseInt(document.getElementById('s-maxiter').value) || 50;

  if (isNaN(x0) || isNaN(x1)) return showErr('secant', 'Nilai x₀ atau x₁ tidak valid');
  if (x0 === x1) return showErr('secant', 'x₀ dan x₁ tidak boleh sama');

  let fx0, fx1;
  try { fx0 = f(x0); fx1 = f(x1); }
  catch (e) { return showErr('secant', 'Error evaluasi awal: ' + e.message); }

  const rows = [], pts = [{ x: x0 }, { x: x1 }];
  let converged = false;

  for (let i = 1; i <= maxIter; i++) {
    if (!isFinite(fx0) || !isFinite(fx1)) {
      showErr('secant', 'Nilai tidak terhingga pada iterasi ' + i);
      break;
    }
    const denom = fx1 - fx0;
    if (Math.abs(denom) < 1e-14) {
      showErr('secant', 'f(x₁)−f(x₀) ≈ 0 pada iterasi ke-' + i + '. Metode gagal.');
      break;
    }

    const x2  = x1 - fx1 * (x1 - x0) / denom;
    const err = Math.abs(x2 - x1);
    rows.push({ iter: i, x: x1, fx: fx1, xnew: x2, err });
    pts.push({ x: x2 });
    x0 = x1; fx0 = fx1;
    x1 = x2;
    try { fx1 = f(x1); }
    catch (e) { showErr('secant', 'Error evaluasi: ' + e.message); break; }
    if (err < tol) { converged = true; break; }
  }

  if (!rows.length) return;
  const last = rows[rows.length - 1];
  let ff;
  try { ff = f(last.xnew); } catch (e) { ff = NaN; }
  renderSummary('summary-secant', last.xnew, ff, rows.length, converged);

  document.getElementById('tbody-secant').innerHTML = rows.map((r, i) => `
    <tr class="${i === rows.length - 1 && converged ? 'converged' : ''}">
      <td>${r.iter}</td>
      <td>${fmt(r.x)}</td>
      <td>${fmt(r.fx)}</td>
      <td>${fmt(r.xnew)}</td>
      <td>${r.err.toExponential(4)}</td>
    </tr>`).join('');

  document.getElementById('res-secant').classList.add('show');
  setTimeout(() => drawChart('chart-secant', f, pts), 60);
}
