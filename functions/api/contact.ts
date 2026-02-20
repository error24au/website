import { Resend } from 'resend';

// Cloudflare Pages uses specific handlers like onRequestPost, onRequestGet, etc.
export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env; // This is where RESEND_API_KEY lives

    // Parse the incoming form data
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend with the environment variable from Cloudflare
    const resend = new Resend(env.RESEND_API_KEY);

    // Send the email
    const { data: resendData, error } = await resend.emails.send({
      from: 'Stagely Contact <info@error24.com.au>',
      to: 'hello@error24.com.au',
      subject: `New Stagely Inquiry from ${name}`,
      replyTo: email.toString(),
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
