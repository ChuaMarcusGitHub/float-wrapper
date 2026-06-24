const DEFAULT_TIMEOUT = 3000;

export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  ms = DEFAULT_TIMEOUT,
) => {
    
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return (...args: T) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
      timerId = null;
    }, ms);
  };
};
