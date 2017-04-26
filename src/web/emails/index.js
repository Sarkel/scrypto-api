/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const pug = require('pug'),
    path = require('path'),
    sendgrid = require('sendgrid'),
    helper = sendgrid.mail;

function getTemplate(templateName) {
    return pug.compileFile(path.join(__dirname, 'templates', templateName))
}

const templates = {
    verificationCode: {
        subject: 'Email verification',
        content: getTemplate('verification_code.pug')
    }
};

function sendEmail(recipient, template, params) {
    const sg = sendgrid(process.env.SENDGRID_API_KEY);
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: new helper.Mail(
            new helper.Email(process.env.EMAIL_SENDER),
            template.subject,
            new helper.Email(recipient),
            new helper.Content('text/html', template.content(params))
        ).toJSON()
    });

    return sg.API(request);
}

const emails = {
    sendVerificationCode: (recipient, recipientName, code) => {
        return sendEmail(recipient, templates.verificationCode, {
            recipientName,
            code
        });
    }
};

module.exports = emails;