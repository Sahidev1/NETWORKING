const { sockmap, messageSocket } = require("../config/websocket");
const { putMessageIntoDb } = require("../models/messagehandler");
const formatResponse = require("../utils/responseFormatter");


const putMessage = async (req, res) => {
    let respSuccess = false;
    let retMsg = "failed";
    if (!req.session.userData || !req.session.userData.validated || !req.session.userData.isAdmin){
        retMsg = "access denied";
        res.json(formatResponse(respSuccess, retMsg));
        return;
    }
    const dt = req.body;

    try {
        const res = await putMessageIntoDb(dt.from_id, dt.to_id, dt.timeof, dt.content);
        respSuccess = res.status;
        retMsg = res.msg;
    } catch (error) {
        console.log(error)
    }
    const userid = dt.to_id;

    const foundKey = Object.keys(sockmap).find(key => sockmap[key].userData?.db_id == userid);
    if (foundKey) await messageSocket(foundKey, 'NEW_MESSAGE');

    res.json(formatResponse(respSuccess, retMsg));
}

module.exports = {putMessage}