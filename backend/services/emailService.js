const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const emailStyles = `
  body {
    background-color: #1a1a1a;
    color: #ffffff;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background-color: #242424;
    border-radius: 12px;
    border: 1px solid #333;
  }
  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #333;
    margin-bottom: 20px;
  }
  h1 {
    color: #a3e635; /* lime-400 */
    margin: 0;
    font-size: 24px;
  }
  h2 {
    font-size: 18px;
    margin-top: 0;
  }
  p {
    line-height: 1.6;
    color: #cccccc;
  }
  .task-box {
    background-color: #1a1a1a;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    border-left: 4px solid #a3e635;
  }
  .task-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
    color: #ffffff;
  }
  .task-desc {
    font-size: 14px;
    color: #a0a0a0;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #666;
  }
`;

const enviarRecordatorioTarea = async (usuario, tarea) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Saltando envío de email.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TaskFlow</h1>
        </div>
        <h2>¡Recordatorio de tarea pendiente!</h2>
        <p>Hola ${usuario.nombre},</p>
        <p>Tienes una tarea que vence en menos de 24 horas. ¡Es hora de ponerte a ello!</p>
        
        <div class="task-box">
          <div class="task-title">${tarea.titulo}</div>
          ${tarea.descripcion ? `<div class="task-desc">${tarea.descripcion}</div>` : ''}
          <div class="task-desc" style="margin-top: 10px; color: #ef4444;">
            <strong>Vence:</strong> ${new Date(tarea.fechaLimite).toLocaleString()}
          </div>
        </div>
        
        <p>¡Mucho ánimo y a por todas!</p>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} TaskFlow. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>', // Use verified domain in production
      to: usuario.email,
      subject: `Recordatorio: ${tarea.titulo} vence pronto`,
      html
    });
    console.log(`Email de recordatorio enviado a ${usuario.email} para la tarea ${tarea._id}`);
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
  }
};

const enviarResumenDiario = async (usuario, tareas) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Saltando envío de email.");
    return;
  }

  if (!tareas || tareas.length === 0) return;

  const tareasHtml = tareas.map(t => `
    <div class="task-box">
      <div class="task-title">${t.titulo}</div>
      ${t.fechaLimite ? `<div class="task-desc" style="color: #a3e635;">Vence: ${new Date(t.fechaLimite).toLocaleDateString()}</div>` : ''}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TaskFlow</h1>
        </div>
        <h2>Tu Resumen Diario</h2>
        <p>Buenos días, ${usuario.nombre}.</p>
        <p>Aquí tienes tus tareas programadas para hoy:</p>
        
        ${tareasHtml}
        
        <p>¡Que tengas un día muy productivo!</p>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} TaskFlow. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>',
      to: usuario.email,
      subject: `Tu resumen diario de TaskFlow - ${tareas.length} tareas para hoy`,
      html
    });
    console.log(`Resumen diario enviado a ${usuario.email}`);
  } catch (error) {
    console.error('Error enviando resumen diario:', error);
  }
};

module.exports = {
  enviarRecordatorioTarea,
  enviarResumenDiario
};
