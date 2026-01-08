import { Document, Schema, model } from "mongoose";

interface IRating {
  rating: number;
  numReviews: number;
  meter: number;
}

interface ITomatoes extends Document {
  viewer: IRating;
  fresh?: number;
  critic?: IRating;
  rotten?: number;
  lastUpdated?: Date;
}

export interface IMoviesDocument extends Document {
  title: string;
  year: number;
  plot: string;
  new:string;
  genres: string[];
  runtime: number;
  imdb: {
    rating: number;
    votes: number;
    id: number;
  }
  cast: string[];
  poster: string;
  fullpolt: string;
  relased: Date;
  languages: string[];
  directors: string[];
  awards: {
    wins: number;
    nominations: number;
    text: string;
  };
  tomatoes: ITomatoes;
}

const TomatoesSchema: Schema<ITomatoes> = new Schema(
  {
    viewer: {
      rating: { type: Number },
      numReviews: { type: Number },
      meter: { type: Number }
    },
    critic: {
      rating: { type: Number },
      numReviews: { type: Number },
      meter: { type: Number }
    },
    rotten: Number,
    lastUpdated: Date
  },
  { _id: false }
);

const MovieSchema: Schema<IMoviesDocument> = new Schema({
  plot: { type: String, required: true },
  new:{ type: String },
  genres: { type: [String],  },
  title: { type: String,  },
  year: { type: Number,  },
  
  runtime: { type: Number,  },
  cast: { type: [String],  },
  poster: { type: String,  },
  
  fullpolt: { type: String },
  relased: { type: Date, default: new Date() },
  languages: { type: [String], },
  directors: { type: [String] },
  awards: {
    wins: { type: Number },
    nominations: { type: Number },
    text: { type: String }
  },
  imdb: {
    rating: { type: Number },
    votes: { type: Number },
    id: { type: Number },
  },
  tomatoes: TomatoesSchema,

});

export const Movies = model<IMoviesDocument>("movies", MovieSchema);