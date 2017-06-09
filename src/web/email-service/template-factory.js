/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const pug = require('pug');
const path = require('path');

class BaseTemplateFactory {
    _getTemplate() {
        return pug.compileFile(path.join(__dirname, 'templates', this._getContentFileName()));
    }

    getSubject() {
    }

    getContent() {
        return this._getTemplate();
    }

    _getContentFileName() {
    }
}

class VerificationCodeTemplateFactory extends BaseTemplateFactory{
    getSubject() {
        return 'Email verification';
    }

    _getContentFileName() {
        return 'verification_code.pug';
    }
}

class AccountActivationTemplateFactory extends BaseTemplateFactory {
    getSubject() {
        return 'Account activation';
    }

    _getContentFileName() {
        return 'account_activation.pug';
    }
}

class AccountDeactivationTemplateFactory extends BaseTemplateFactory {
    getSubject() {
        return 'Account deactivation';
    }

    _getContentFileName() {
        return 'account_deactivation.pug';
    }
}

class ChangedPasswordTemplateFactory extends BaseTemplateFactory {
    getSubject() {
        return 'Changed password';
    }

    _getContentFileName() {
        return 'changed_password.pug';
    }
}

module.exports = {
    VerificationCodeTemplateFactory,
    AccountActivationTemplateFactory,
    BaseTemplateFactory,
    AccountDeactivationTemplateFactory,
    ChangedPasswordTemplateFactory
};