/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const sendgrid = require('sendgrid');
const Helper = sendgrid.mail;
const templateFactories = require('./template-factory');
const {ServerError} = require('../utilities/error-factory');

class EmailService {
    static _prepareEmail(recipient, template, params) {
        const sg = sendgrid(process.env.SENDGRID_API_KEY);
        return sg.API(
            sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: new Helper.Mail(
                    new Helper.Email(process.env.EMAIL_SENDER),
                    template.getSubject(),
                    new Helper.Email(recipient),
                    new Helper.Content('text/html', template.getContent()(params))
                ).toJSON()
            })
        );
    }
    static _sendEmail(recipient, template, params) {
        return template instanceof templateFactories.BaseTemplateFactory ?
            EmailService._prepareEmail(recipient, template, params) :
            Promise.reject(new ServerError());
    }

    static sendVerificationCode(recipient, recipientName, code) {
        return EmailService._sendEmail(recipient, new templateFactories.VerificationCodeTemplateFactory(), {
            recipientName,
            code
        });
    }

    static sendAccountActivationNotification(recipient, recipientName) {
        return EmailService._sendEmail(recipient, new templateFactories.AccountActivationTemplateFactory(), {
            recipientName
        });
    }

    static sendAccountDeactivationNotification(recipient, recipientName) {
        return EmailService._sendEmail(recipient, new templateFactories.AccountDeactivationTemplateFactory(), {
            recipientName
        });
    }

    static sendPasswordChangeNotification(recipient, recipientName) {
        return EmailService._sendEmail(recipient, new templateFactories.ChangedPasswordTemplateFactory(), {
            recipientName
        });
    }
}

module.exports = {EmailService};