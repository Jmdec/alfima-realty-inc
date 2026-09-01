// lib/push-client.ts

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);

  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Verify whether the current browser's push subscription
 * still exists on the Laravel backend.
 */
export async function verifyPushSubscription(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");

    if (!reg) {
      return false;
    }

    const sub = await reg.pushManager.getSubscription();

    if (!sub) {
      return false;
    }

    const res = await fetch("/api/push/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
      }),
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();

    if (!data.exists) {
      // Server no longer has this device registered.
      // Remove the stale browser subscription.
      try {
        await sub.unsubscribe();
      } catch (unsubscribeError) {
        console.error(
          "Failed to unsubscribe stale push subscription:",
          unsubscribeError,
        );
      }

      return false;
    }

    return true;
  } catch (err) {
    console.error("Push verify failed:", err);
    return false;
  }
}

/**
 * Enable push notifications for the current browser/device.
 */
export async function enablePushNotifications(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return {
      ok: false,
      reason: "Push not supported on this browser/device.",
    };
  }

  // NEXT_PUBLIC_ is required because this value is used
  // in the browser/client-side bundle.
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) {
    return {
      ok: false,
      reason:
        "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY. Set it in .env.local and restart the Next.js dev server.",
    };
  }

  // Ask the user for notification permission.
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return {
      ok: false,
      reason: "Notification permission denied.",
    };
  }

  try {
    // Register the service worker.
    const reg = await navigator.serviceWorker.register("/sw.js");

    // Wait until the service worker is ready.
    await navigator.serviceWorker.ready;

    // Check whether this browser already has a subscription.
    let sub = await reg.pushManager.getSubscription();

    // If there is no existing subscription, create one.
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    // Convert PushSubscription into the format
    // expected by the Laravel backend.
    const subJson = sub.toJSON();

    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return {
        ok: false,
        reason: "Invalid push subscription data.",
      };
    }

    const payload = {
      endpoint: subJson.endpoint,
      public_key: subJson.keys.p256dh,
      auth_token: subJson.keys.auth,
    };

    // Send subscription through the Next.js proxy.
    // The proxy handles the auth_token cookie server-side
    // and forwards the Bearer token to Laravel.
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Failed to save subscription on server.";

      try {
        const errorData = await res.json();

        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Ignore JSON parsing errors.
      }

      return {
        ok: false,
        reason: errorMessage,
      };
    }

    return {
      ok: true,
    };
  } catch (err) {
    console.error("Enable push notifications failed:", err);

    return {
      ok: false,
      reason:
        err instanceof Error
          ? err.message
          : "Failed to enable push notifications.",
    };
  }
}
