import { connect } from "mongoose";

const dbUri = process.env.MONGO_URI || "";

const connection = connect(dbUri);

export default connection;
