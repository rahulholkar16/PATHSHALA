import Mailgen from "mailgen";

const emailVerificationContent = (name, verificationUrl) => {
    return {
        body: {
            name: name,
            intro: "Welcome to our App! we'are excited to have you on board.",
            action: {
                instruction: "To verify your email please click on the following button",
                button: {
                    color: "rgba(48, 236, 48, 0.67)",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        }
    }
}

const forgotPasswordContent = (name, passwordResetUrl) => {
    return {
        body: {
            name: name,
            intro: "We got a request to reset the password of your account.",
            action: {
                instruction: "To reset your password click on the following button or link",
                button: {
                    color: "rgba(48, 236, 48, 0.67)",
                    text: "Reset password",
                    link: passwordResetUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        }
    }
}

export { emailVerificationContent, forgotPasswordContent };