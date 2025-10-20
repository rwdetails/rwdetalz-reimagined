import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function localEmailEndpoints(): Plugin {
  return {
    name: "local-email-endpoints",
    configureServer(server) {
      const cors = (res: any) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
      };
      const readBody = (req: any) => new Promise<string>((resolve) => {
        let data = "";
        req.on("data", (chunk: any) => { data += chunk; });
        req.on("end", () => resolve(data));
      });
      const sendEmail = async (payload: { from: string; to: string[]; subject: string; html: string }) => {
        const key = process.env.RESEND_API_KEY;
        if (!key) throw new Error("Missing RESEND_API_KEY");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Resend error: ${res.status} ${text}`);
        }
        return res.json();
      };

      server.middlewares.use("/api/send-cancellation-email", async (req, res) => {
        cors(res);
        if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
        if (req.method !== "POST") { res.statusCode = 405; return res.end("Method Not Allowed"); }
        try {
          const bodyStr = await readBody(req);
          const data = JSON.parse(bodyStr || "{}");
          const servicesHtml = (data.services || []).map((s: string) => `<li>${s}</li>`).join("");
          const html = `
            <h2>Booking Cancelled</h2>
            <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Services:</strong></p>
            <ul>${servicesHtml}</ul>
            ${data.totalAmount ? `<p><strong>Total Amount:</strong> $${data.totalAmount}</p>` : ""}
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          `;
          await sendEmail({ from: "RWDetailz <onboarding@resend.dev>", to: ["rwdetailz@gmail.com"], subject: `Booking Cancelled - ${data.bookingNumber}`, html });
          await sendEmail({ from: "RWDetailz <onboarding@resend.dev>", to: [data.email], subject: `Your Booking Has Been Cancelled - ${data.bookingNumber}` , html });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      server.middlewares.use("/api/send-completion-email", async (req, res) => {
        cors(res);
        if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
        if (req.method !== "POST") { res.statusCode = 405; return res.end("Method Not Allowed"); }
        try {
          const bodyStr = await readBody(req);
          const data = JSON.parse(bodyStr || "{}");
          const servicesHtml = (data.services || []).map((s: string) => `<li>${s}</li>`).join("");
          const html = `
            <h2>Service Completed</h2>
            <p><strong>Booking #:</strong> ${data.bookingNumber}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Services:</strong></p>
            <ul>${servicesHtml}</ul>
            ${data.totalAmount ? `<p><strong>Total:</strong> $${data.totalAmount}</p>` : ""}
          `;
          await sendEmail({ from: "RWDetailz <onboarding@resend.dev>", to: ["rwdetailz@gmail.com"], subject: `Booking Completed - ${data.bookingNumber}`, html });
          await sendEmail({ from: "RWDetailz <onboarding@resend.dev>", to: [data.email], subject: `Thanks! Your Service Is Complete - ${data.bookingNumber}`, html });
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), localEmailEndpoints()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
