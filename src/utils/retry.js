export async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (err) {
            attempt++;
            if (attempt >= retries) throw err;
            const backoff = delay * 2 ** attempt;
            console.log(`Retrying in ${backoff}ms...`);
            await new Promise(res => setTimeout(res, backoff));
        }
    }
}
