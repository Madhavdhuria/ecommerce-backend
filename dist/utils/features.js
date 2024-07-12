import mongoose from "mongoose";
export const DBConnect = () => {
    mongoose
        .connect("mongodb+srv://madhav:2003%40Mongo2024@cluster0.xaijqpg.mongodb.net/mystrymsg", {
        dbName: "Ecommerce_24",
    })
        .then((c) => {
        console.log("Db Connected to ", c.connection.host);
    })
        .catch((e) => {
        console.log(e);
    });
};
