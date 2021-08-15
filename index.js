'use strict';
const AWS = require('aws-sdk');
const ses = new AWS.SESV2({ apiVersion: '2019-09-27' });

const ToAddresses = !!process.env.TO_ADDRESS ? process.env.TO_ADDRESS.split(',') : ["contact@coromite.com"];
const CcAddresses = !!process.env.CC_ADDRESS ? process.env.CC_ADDRESS.split(',') : [];

function isValidBody({ firstName, lastName, email, message }) {
    const isValidString = (data, isRequired = false) => {
        return typeof data === "string" && (isRequired ? !!data : true);
    }

    // For now, no fields are required. I want to see who is trying to reach Coromite. In the future, this might change.
    return isValidString(firstName) && isValidString(lastName) && isValidString(email) && isValidString(message);
}

exports.handler = async(event) => {
    try {
        const { firstName, lastName, email, message } = JSON.parse(event.body);

        console.log("Invoked:", { firstName, lastName, email, message });

        if (!isValidBody({ firstName, lastName, email, message })) {
            console.warn("Invalid body!");
            return Promise.resolve({
                statusCode: 422
            });
        }

        return new Promise((resolve) => {
            return ses.sendEmail({
                Destination: {
                    ToAddresses,
                    CcAddresses
                },
                Content: {
                    Simple: {
                        Subject: {
                            Data: "Coromite - New Contact"
                        },
                        Body: {
                            Text: {
                                Data: `First Name: ${firstName}\nLast Name: ${lastName}\nemail: ${email}\n\nMessage:\n${message}`
                            }
                            // Html: {
                            //     Data: `<h1>Coromite - New Contact</h1><p>First Name: ${firstName}</p><p>Last Name: ${lastName}</p><p>email: ${email}</p><p>Message: ${message}</p>`
                            // }
                        }
                    }
                },
                FromEmailAddress: "noreply@coromite.com",
            }, (err, data) => {
                if (err) {
                    console.error("Error sending email:", err);
                    return resolve({
                        statusCode: 500
                    });
                }

                console.log("Email sent:", data);
                return resolve({
                    statusCode: 200
                })
            });
        });
    } catch (err) {
        console.error("Error handling request:", err);
        return Promise.resolve({
            statusCode: 500
        });
    }
};