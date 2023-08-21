// OAuth 2.0 Authorization Code with Proof Key for Code Exchange (PKCE)

const authorizeEndpoint = "https://AUTH_SERVER_HOST/oauth/authorize"; // Replace with yours
const tokenEndpoint = "https://AUTH_SERVER_HOST/oauth/token"; // Replace with yours
const clientId = "CLIENT_ID"; // Replace with yours

if (window.localStorage.getItem("access_token") == null) {
    var args = new URLSearchParams(window.location.search);
    var code = args.get("code");

    if (code) {
        var xhr = new XMLHttpRequest();

        xhr.onload = function() {
            var response = xhr.response;
            if (xhr.status == 200) {
                window.localStorage.setItem("access_token", response.access_token);
            }
            else {
                authorize();
            }
        };
        xhr.responseType = 'json';
        xhr.open("POST", tokenEndpoint, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(new URLSearchParams({
            client_id: clientId,
            code_verifier: window.localStorage.getItem("code_verifier"),
            grant_type: "authorization_code",
            redirect_uri: location.href.replace(location.search, ''),
            code: code
        }));
    }
    else {
        authorize();
    }
}

function authorize() {
    var codeVerifier = generateRandomString(64);
    const challengeMethod = crypto.subtle ? "S256" : "plain"

    Promise.resolve()
        .then(() => {
                if (challengeMethod === 'S256') {
                    return generateCodeChallenge(codeVerifier)
                } else {
                    return codeVerifier
                }
        })
        .then(function(codeChallenge) {
                window.localStorage.setItem("code_verifier", codeVerifier);

                var redirectUri = window.location.href.split('?')[0];
                var args = new URLSearchParams({
                            response_type: "code",
                            client_id: clientId,
                            code_challenge_method: challengeMethod,
                            code_challenge: codeChallenge,
                            redirect_uri: redirectUri
                });
        window.location = authorizeEndpoint + "/?" + args;
    });
}

async function generateCodeChallenge(codeVerifier) {
    var digest = await crypto.subtle.digest("SHA-256",
        new TextEncoder().encode(codeVerifier));

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}