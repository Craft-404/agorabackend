const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const nanoid = require("nano-id");

const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require("agora-access-token");
const auth = require("./middleware/auth");
const Meet = require("./models/Meet");

mongoose.set("strictPopulate", false);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const nocache = (_, resp, next) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

const ping = (req, resp) => {
  resp.send({ message: "pong" });
};

app.use(bodyParser.json());

const MONGO_URI = process.env.MONGO_URI;

app.post("/meet", auth, async (req, res) => {
  try {
    const hostId = req.user._id;
    const { invitedUsers } = req.body;
    const invited = [];
    invitedUsers.forEach((user) => {
      invited.push(mongoose.Types.ObjectId(user));
    });
    const channelId = nanoid();
    const meet = new Meet({
      host: hostId,
      invitedUsers: invited,
      channelId,
    });
    await meet.save();
    res.status(200).send({ channelId, role: "host" });
  } catch (error) {
    res.status(500);
    console.log(error);
  }
});

app.patch("/meet", auth, async (req, res) => {
  try {
    const { channelId, invitedUsers } = req.body;
    const invited = [];
    invitedUsers.forEach((user) => invited.push(mongoose.Types.ObjectId(user)));
    const meet = await Meet.findOne({ channelId });
    invited.concat(meet.invitedUsers);
    meet.invitedUsers = invited;
    await meet.save();
    res.status(200).send({ message: "User added successfully" });
  } catch (error) {
    res.status(500);
    console.log(error);
  }
});

app.delete("/meet", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { channelId } = req.body;
    const meet = await Meet.findOne({ channelId });
    if (meet.host.equals(userId)) {
      await meet.delete();
      res.send(200).status({ message: "Meet Deleted" });
    } else {
      res.status(500).send({ message: "You cannot delete this meet" });
    }
  } catch (error) {
    res.status(500);
    console.log(error);
  }
});

const generateRTCToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(500).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(500).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  let token;
  if (req.params.tokentype === "userAccount") {
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else if (req.params.tokentype === "uid") {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else {
    return resp.status(500).json({ error: "token type is invalid" });
  }
  // return the token
  return resp.json({ rtcToken: token });
};

const generateRTMToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");

  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(500).json({ error: "uid is required" });
  }
  // get role
  let role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtmToken: token });
};

const generateRTEToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(500).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(500).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtcToken: rtcToken, rtmToken: rtmToken });
};

app.options("*", cors());
app.get("/ping", nocache, ping);
app.get("/rtc/:channel/:role/:tokentype/:uid", nocache, generateRTCToken);
app.get("/rtm/:uid/", nocache, generateRTMToken);
app.get("/rte/:channel/:role/:tokentype/:uid", nocache, generateRTEToken);

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("DB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  });
