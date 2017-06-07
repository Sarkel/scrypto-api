/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const sendgrid = require('sendgrid');
const Helper = sendgrid.mail;

class EmailService {
    static _sendEmail(recipient, template, params) {
        const sg = sendgrid(process.env.SENDGRID_API_KEY);
        return sg.API(
            sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: new Helper.Mail(
                    new Helper.Email(process.env.EMAIL_SENDER),
                    template.subject,
                    new Helper.Email(recipient),
                    new Helper.Content('text/html', template.content(params))
                ).toJSON()
            })
        );
    }

    static sendVerificationCode(recipient, recipientName, code) {
        return EmailService._sendEmail(recipient, TemplateFactory.VERIFICATION_CODE, {
            recipientName,
            code
        });
    }
}

module.exports = {EmailService};