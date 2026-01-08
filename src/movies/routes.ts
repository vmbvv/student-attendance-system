import { Router, Request, Response } from "express";
import { Movies } from "./models.ts";
import { Types } from "mongoose";
import { generateKey } from "node:crypto";

export const movieRouter = Router();

movieRouter.get("/movies", async (req: Request, res: Response) => {
  // 1. Шинээр нэг кино нэм. Жишээ нь: нэр нь "Galaxy Quest", гарсан он нь 2023, жанрууд нь "Sci-Fi" ба "Comedy", найруулагч нь "Jane Smith", жүжигчид нь "Actor X" ба "Actor Y",
  const movie = await Movies.insertOne({
    title: "Galaxy Quest",
    plot: "jdfvhjdvbdfhj",
  });

  console.log("1", movie);

  // 2. "Galaxy Quest" киноны IMDb рейтингийг 8.2 болгон шинэчлэх.
  const movieTwo = await Movies.findOneAndUpdate(
    {
      _id: movie._id,
    },
    {
      $set: {
        rating: 8.2,
      },
    },
    {
      new: true,
    }
  );

  console.log("2", movieTwo);

  // 3. "Galaxy Quest" киноны жанруудын массивт "Adventure" жанрыг нэм.

  const movieThree = await Movies.updateOne(
    {
      _id: movie._id,
    },
    {
       $push: {
        genres: "Advanture",
      },
    }
  );

  console.log("3", movieThree);

  // 4. "Galaxy Quest" киног устга.

  const movieFour = await Movies.deleteOne({
    _id: movie._id,
  });

  console.log("4", movieFour);

  // 5. 2015 оноос хойш гарсан бүх киноны IMDb рейтингийг 0.5-аар нэм. $inc

  const movieFive = await Movies.updateOne(
    {
      year: { $gte: 2015 },
    },
    {
      $inc: {
        rating: 0.5,
      },
    }
  );

  console.log("5", movieFive);

  //  6.  IMDb рейтинг нь 9-с дээш кинонуудын нэрийг жагсаа
  const movieSix = await Movies.find({ "imdb.rating": { $gte: 6 } }, { title: 1 }).limit(3).lean();

  console.log("6", movieSix);

  // 7. Жанраар "Drama" кинонуудыг олж, гарсан он, IMDb рейтингийг хамт харуул.

  const movieSeven = await Movies.find(
    {
      genres: "Drama",
    },
    { year: 1, rating: 1 }
  ).limit(3).lean();

  console.log("7", movieSeven);

  // 8. Хамгийн олон review-той киноны нэр, review тоог гарга. $size
  const movieEight: any = await Movies.find().sort({ "tomatoes.viewer.numReviews" : -1 }).limit(1)
  console.log("8",movieEight[0]?.tomatoes?.viewer )
});
