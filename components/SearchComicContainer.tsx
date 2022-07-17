import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  TextField,
  Grid,
} from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { SEO } from "../modules/seo";
import { Comic } from "../types";
import { ComicCard } from "./ComicCard";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { capitalizeFirstLetter } from "../modules/helper";

export default function SearchComicContainer({
  comics,
  context,
  title,
  query,
}: {
  query: string;
  title: string;
  context: "comic" | "genre" | "author";
  comics: Comic[];
}) {
  const { push, pathname } = useRouter();
  const [type, setType] = useState<undefined | string>(
    capitalizeFirstLetter(title as string)
  );
  const [mode, setMode] = useState(title == "all" ? "Text Mode" : "Card Mode");

  const getSortedObject = () => {
    const a = 65;
    const z = 91;

    const map: Record<string, Comic[]> = {};
    map["*"] = [];

    for (let i = a; i <= z; i++) {
      map[String.fromCharCode(i)] = [];
    }

    comics.forEach((item) => {
      const firstLetter = item.name.charAt(0).toUpperCase();

      if (!map[firstLetter]) {
        map["*"].push(item);
      } else {
        map[firstLetter].push(item);
      }
    });

    return map;
  };

  const sorted = getSortedObject();

  return (
    <Box sx={{ m: 1 }}>
      {/* <NextSeo {...SEO} title={"Daftar Komik " + title} /> */}
      <Paper sx={{ p: 1 }}>
        {context == "comic" && (
          <Box sx={{ display: "flex" }}>
            <Typography variant="h5">
              Daftar Komik {(title as string)?.toUpperCase()}
            </Typography>
          </Box>
        )}
        {title !== "all" && (
          <>
            <Divider sx={{ my: 1 }} />
            {["Manga", "Manhwa", "Manhua"].map((e) => (
              <Chip
                label={e}
                key={e}
                sx={{ mx: 0.2 }}
                color={e == type ? "primary" : "secondary"}
                onClick={() => {
                  setType(e == type ? undefined : e);
                  push(
                    `/list/${context}/${title.toLowerCase()}?type=${e.toLowerCase()}${
                      mode == "Text Mode" ? "&all=true" : ""
                    }`
                  );
                }}
              />
            ))}
            <Divider sx={{ my: 1 }} />
            {/* {["Card Mode", "Text Mode"].map((e) => (
              <Chip
                label={e}
                key={e}
                sx={{ mx: 0.2 }}
                color={e == mode ? "primary" : "secondary"}
                onClick={() => {
                  if (e == "Text Mode") {
                    push(
                      `/list/${context}/${title.toLowerCase()}?all=true${
                        type ? `&type=${type.toLowerCase()} ` : ""
                      }`
                    );
                    setMode(e);
                  } else {
                    setMode(e);
                  }
                }}
              />
            ))}
            <Divider sx={{ my: 1 }} /> */}
          </>
        )}
        <TextField
          label="Cari Komik"
          size="small"
          fullWidth
          onChange={(e) => {
            push(`/list/${context}/${title}?q=` + e.target.value);
          }}
        />
        <Divider sx={{ my: 1 }} />
        {mode == "Card Mode" && title !== "all" ? (
          <>
            <Grid
              spacing={1}
              container
              sx={{ pt: 2, px: { xs: undefined, md: 10 } }}
            >
              {comics.map((e, i) => (
                <Grid item key={e.id} xs={6} sm={3} lg={2}>
                  <ComicCard layout="carousel" {...e} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box>
            {Object.keys(sorted).map((e) => {
              return (
                <Box key={e} sx={{ mt: 2 }}>
                  <Typography variant="h5">{e}</Typography>
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {sorted[e].map((e, i) => (
                      <Grid item xs={6} sm={3} lg={2} key={e.id}>
                        <Link href={"/comic/" + e.slug}>
                          <a>
                            <Typography variant="body1">{e.name}</Typography>
                          </a>
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}
        {comics.length == 0 && (
          <Typography variant="h5">Komik `{query}` tidak ditemukan </Typography>
        )}
      </Paper>
    </Box>
  );
}
