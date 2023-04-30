import {InstagramBot} from "./instagram-api.js";

const auth = {
    username: 'testusername',
    password: 'testpassword',
};

const bot = new InstagramBot(auth);

(async () => {
    try {
        await bot.init();
        await bot.login();
    } catch (error) {
        console.error(error);
    }
})();