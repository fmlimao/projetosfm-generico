const path = require('path');

module.exports = (req, res, next) => {
    if (process.env.SITE_MAINTENANCE == 1) {
        return res.sendFile(path.resolve(__dirname, '../../views/site/maintenance.html'));
    }

    next();
};
