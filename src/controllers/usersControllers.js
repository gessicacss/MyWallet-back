import db from "../app.js";
import signInSchema from "../schemas/signInSchema.js";
import signUpSchema from "../schemas/signUpSchema.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export async function signUp(req, res) {
  const { name, email, password } = req.body;
  const validation = signUpSchema.validate(req.body);
  const hashPassword = bcrypt.hashSync(password, 10);
  try {
    if (validation.error) {
      return res.status(422).send(validation.error.message);
    }

    const user = await db.collection("users").findOne({ email });
    if (user) {
      return res.status(409).send("User already exists");
    }
    await db
      .collection("users")
      .insertOne({ name, email, password: hashPassword });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function signIn(req, res) {
  const { email, password } = req.body;
  const validation = signInSchema.validate(req.body);
  try {
    if (validation.error) {
      return res.status(422).send(validation.error.message);
    }

    const user = await db.collection("users").findOne({ email });
    if (!user){
        return res.sendStatus(404);
    }
    if (user && !bcrypt.compareSync(password, user.password)) {
      return res.sendStatus(401);
    }
    const token = uuid();
    await db.collection("sessions").insertOne({ token, userId: user._id });
    res.status(200).send(token);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
