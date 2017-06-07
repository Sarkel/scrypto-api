/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
class Logger {
    static getInstance() {
        if(!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    info(message) {
        console.log(message);
    }

    error(err) {
        console.error(err);
    }
}



module.exports = {Logger};