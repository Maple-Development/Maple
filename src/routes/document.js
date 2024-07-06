// @ts-ignore
export function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
  
      document.body.appendChild(script);
      console.log("Loaded script: " + src);
      script.addEventListener('load', () => resolve(script));
      script.addEventListener('error', () => reject(script));
    });
}