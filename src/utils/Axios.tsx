import axios from "axios";

const Axios = axios.create({
    baseURL: "https://learn.wdylt.com/wp-json",
});

Axios.interceptors.request.use(async (config: any) => {
    const runInChromeExt = window.chrome && chrome.runtime && chrome.runtime.id;

    if (runInChromeExt) {
        const data = await chrome.storage.local.get(["user"]);
        if (data && Object.keys(data).length > 0) {
            config.headers.Authorization = data.user.token ? `Bearer ${data.user.token}` : '';
        }
    } else {
        config.headers.Authorization = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L3d3dy93cC93ZHlsdCIsImlhdCI6MTc0NDMwMDk1MiwibmJmIjoxNzQ0MzAwOTUyLCJleHAiOjE3NDQ5MDU3NTIsImRhdGEiOnsidXNlciI6eyJpZCI6IjI2In19fQ.2GNloQ_fg537NguOrv-RZBc2ZTO12and6yRIwS99gPM';
    }

    return config;
});

export default Axios;

