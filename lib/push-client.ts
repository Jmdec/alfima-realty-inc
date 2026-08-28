// Call this from your admin/agent dashboard (Next.js), e.g. via an
// "Enable Notifications" button. Goes through the Next.js proxy route
// (app/api/push/subscribe/route.ts), same pattern as ADMIN_API in
// AdminChatPage — the proxy reads the auth_token cookie server-side and
// forwards it as a Bearer token to Laravel, so no manual header needed here.

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  // Explicitly typed ArrayBuffer (not ArrayBufferLike) so this satisfies
  // PushManager.subscribe()'s BufferSource requirement under newer TS DOM libs.
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
// Add this function to lib/push-client.ts, alongside enablePushNotifications

export async function verifyPushSubscription(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return false;

  try {
    const res = await fetch("/api/push/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    if (!res.ok) return false;
    const data = await res.json();

    if (!data.exists) {
      // Server no longer has this device registered — clean up the
      // stale browser-side subscription so it doesn't linger forever.
      await sub.unsubscribe();
      return false;
    }
    return true;
  } catch (err) {
    console.error("Push verify failed:", err);
    return false;
  }
}
export async function enablePushNotifications(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "Push not supported on this browser/device." };
  }

  // Fail loudly instead of silently subscribing with an empty/invalid key.
  // This must match config/webpush.php's `public_key` (i.e. the same value
  // as VAPID_PUBLIC_KEY in .env, but exposed to the client via a
  // NEXT_PUBLIC_-prefixed variable — Next.js will not inline non-prefixed
  // env vars into the browser bundle).
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return {
      ok: false,
      reason:
        "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY. Set it in .env(.local) and restart the dev server.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission denied." };
  }

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(sub.toJSON()),
  });

  if (!res.ok) {
    return { ok: false, reason: "Failed to save subscription on server." };
  }

  return { ok: true };
}
