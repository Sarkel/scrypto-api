/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const pug = require('pug');
const path = require('path');

class TemplateFactory {
    static _getTemplate(templateName) {
        return pug.compileFile(path.join(__dirname, 'templates', templateName))
    }
}

TemplateFactory.VERIFICATION_CODE = {
    subject: 'Email verification',
    content: TemplateFactory._getTemplate('verification_code.pug')
};

module.exports = {TemplateFactory};