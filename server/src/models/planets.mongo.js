import mongoose from "mongoose";

const planetsSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    },
});

const planets = mongoose.model('Planet', planetsSchema);

export default planets;