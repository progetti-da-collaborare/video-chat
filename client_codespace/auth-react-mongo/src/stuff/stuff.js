const httpRequest = async (url, method, body, token) => {
    console.log("- " + url)
            console.log("- " + window.location.protocol)
    const headers = {
        //Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        "Content-Type": "application/json"
    }

    return await fetch( url, {
        method: method,
        body: JSON.stringify(body),
        headers: headers
})
}

export { httpRequest }