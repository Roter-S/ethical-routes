/* This is a reusable error component */
export function Error({ message }: { message?: string[] | string }) {
  if (!message || (Array.isArray(message) && message.length === 0)) {
    return null;
  }
  return <p class="text-red-500 dark:text-red-400 text-sm my-2">{message}</p>;
}
