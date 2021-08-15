'use strict';
const AWS = require('aws-sdk');
const ses = new AWS.SESV2({ apiVersion: '2019-09-27' });


function isValidBody({ firstName, lastName, email, message }) {
    const isValidString = (data, isRequired = false) => {
        return typeof data === "string" && (isRequired ? !!data : true);
    }

    // For now, no fields are required. I want to see who is trying to reach Coromite. In the future, this might change.
    return isValidString(firstName) && isValidString(lastName) && isValidString(email) && isValidString(message);
}

exports.handler = async(event) => {
    try {
        const body = JSON.parse(event.body);

        console.log("Invoked:", body);

        if (!isValidBody(body)) {
            console.warn("Invalid body!");
            return Promise.resolve({
                statusCode: 422
            });
        }
    } catch (err) {
        console.error("Error handling request:", err);
        return Promise.resolve({
            statusCode: 500
        });
    }
};