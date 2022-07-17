/* eslint-disable @next/next/no-img-element */
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter, useRouter } from "next/router";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import {
  ChangeCircle,
  NavigateBefore,
  NavigateNext,
  Report,
  SkipPrevious,
} from "@mui/icons-material";
import { gql, useQuery } from "@apollo/client";
import { GetServerSideProps } from "next";
import { Comic, Chapter, Ads as AdsType, AdsPosition } from "../../../../types";
import { NextSeo } from "next-seo";
import moment from "moment";
import { SEO } from "../../../../modules/seo";
import Link from "next/link";
import { event } from "../../../../modules/gtag";
import { Ads } from "../../../../components/Ads";
import { client } from "../../../../modules/client";

function Id({
  chapter,
  UPPER_ADS,
  BOTTOM_ADS,
}: {
  chapter: Chapter;
  UPPER_ADS: AdsType[];
  BOTTOM_ADS: AdsType[];
}) {
  const { push, query } = useRouter();

  const { page } = query;
  const comic: Comic = chapter.comic as Comic;
  const title =
    "Baca " + comic.name + ` Chapter ${chapter.name} ` + SEO.padding;
  const [readMode, setReadMode] = useState<"single" | "longstrip">("longstrip");
  const [imageIndex, setImageIndex] = useState(
    isNaN(parseInt(page as string)) ? 0 : parseInt(page as string)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const images = chapter.imageUrls;

  const { data: { findManyChapter: chapters } = {}, loading } = useQuery<{
    findManyChapter: Chapter[];
  }>(
    gql`
      query FindComicChapter($where: ChapterWhereInput) {
        findManyChapter(where: $where) {
          id
          name
          createdAt
        }
      }
    `,
    {
      variables: {
        where: {
          comicId: {
            equals: comic.id,
          },
        },
      },
    }
  );

  useEffect(() => {
    page && setImageIndex(parseInt(page as string));
  }, [page]);

  useEffect(() => {
    if (chapter) {
      if (chapter.comic.type != "manga") {
        setReadMode("longstrip");
      }

      event({
        action: "view_item",
        category: "chapter",
        label: `${comic.name}-${chapter.name}`,
      });

      images.forEach((e) => {
        const img = new Image();
        img.src = e;
      });
    }
  }, [chapter, images, comic]);

  const Navigation = () =>
    readMode == "single" ? (
      <Paper sx={{ mb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton onClick={prev}>
            <NavigateBefore />
          </IconButton>
          <Box>
            {imageIndex + 1}/{images.length}
          </Box>
          <IconButton onClick={next}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Paper>
    ) : (
      <></>
    );

  const next = () => {
    if (imageIndex < images.length - 1) setImageIndex((i) => i + 1);
  };
  const prev = () => {
    if (imageIndex > 0) setImageIndex((i) => i - 1);
  };

  const sorts = chapters ? [...chapters].sort((e, x) => e.name - x.name) : [];

  const nextChapter = () => {
    let idx = 0;
    //@ts-ignore
    for (const x of sorts) {
      if (x.id == chapter.id) {
        const next = sorts[idx + 1];

        if (next) {
          push(`/comic/${comic.slug}/chapters/${next.name}?page=0`);
        }
      }

      idx++;
    }
  };
  const prevChapter = () => {
    let idx = 0;

    //@ts-ignore
    for (const x of sorts) {
      if (x.id == chapter.id) {
        const sorts = [...(chapters ?? [])].sort((e, x) => e.name - x.name);

        const prev = sorts[idx - 1];
        if (prev) {
          push(`/comic/${comic.slug}/chapters/${prev.name}?page=0`);
        }
      }

      idx++;
    }
  };

  const Header = () => (
    <Paper sx={{ mb: 1 }}>
      <Box>
        <Link href={`/comic/${comic.slug}`}>
          <a>
            <Typography
              textAlign={"center"}
              variant="h6"
              textTransform="uppercase"
            >
              {title}
            </Typography>
          </a>
        </Link>
      </Box>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            gap: 0.2,
          }}
        >
          <Button onClick={prevChapter} variant="contained">
            Prev
          </Button>
          {/* <Typography
              textAlign={"center"}
              variant="body1"
              textTransform="uppercase"
            >
              Chapter 10
            </Typography> */}

          <FormControl fullWidth>
            <Select
              onChange={(e) => {
                push(`/comic/${comic.slug}/chapter/` + e.target.value);
              }}
              size="small"
              value={chapter.id}
            >
              <MenuItem value={chapter.id} selected>
                Chapter {chapter.name}
              </MenuItem>
              {sorts
                .filter((e) => e.id != chapter.id)
                .map((e) => (
                  <MenuItem value={e.name} key={e.id}>
                    Chapter {e.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button onClick={nextChapter} variant="contained">
            Next
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Container>
      <NextSeo
        title={title}
        description={comic.description ?? ""}
        canonical={SEO.canonical + "/comic/" + comic.slug}
        openGraph={{
          url: SEO.canonical + "/comic/" + comic.slug,
          title: title,
          description: comic.description ?? "",
          type: "article",
          article: {
            publishedTime: moment(comic.createdAt).format(),
            modifiedTime: moment(comic.updatedAt).format(),
            //@ts-ignore
            authors: [SEO.canonical + "/list/author/" + comic.author.slug],
            //@ts-ignore
            tags: comic.genres.map((e) => e.name),
          },
          images: [
            {
              url: comic.thumb,
              width: 200,
              height: 250,
              alt: "Komik " + comic.name,
            },
          ],
        }}
        twitter={{
          handle: "@gudang_komik",
          site: "@gudang_komik",
          cardType: "summary_large_image",
        }}
      />
      <Header />
      <Navigation />
      <div ref={containerRef} />
      <Paper sx={{ mb: 1 }}>
        {UPPER_ADS?.map((e) => (
          <Ads {...e} key={e.id} />
        ))}
        {readMode === "single" ? (
          <img
            src={images[imageIndex]}
            alt="comic"
            height={"100%"}
            width={"100%"}
            onClick={(e) => {
              //@ts-ignore
              var x = e.pageX - e.target.offsetLeft;
              //@ts-ignore
              if (x < e.target.width / 2) {
                //left
                prev();
              } else {
                //right
                next();
              }
            }}
          />
        ) : (
          <>
            {images.map((e, i) => (
              <img key={e} src={e} alt={title} height={"100%"} width={"100%"} />
            ))}
          </>
        )}
        {BOTTOM_ADS?.map((e) => (
          <Ads {...e} key={e.id} />
        ))}
      </Paper>

      <Navigation />
      <Header />
      <Paper sx={{ mb: 1, p: 1, display: "flex", gap: 1 }}>
        <Button variant="contained" endIcon={<Report />}>
          LAPOR
        </Button>
        <Button
          variant="contained"
          endIcon={<ChangeCircle />}
          onClick={() => {
            setReadMode(readMode === "single" ? "longstrip" : "single");
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }}
        >
          UBAH MODE BACA
        </Button>
      </Paper>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { name, slug } = context.query;
  if (!name) {
    return {
      notFound: true,
    };
  }

  const { data: { findFirstChapter } = {}, error: errorChapter } =
    await client.query<{
      findFirstChapter: Chapter;
    }>({
      query: gql`
        query FindFirstChapter($where: ChapterWhereInput) {
          findFirstChapter(where: $where) {
            id
            name
            title
            comic {
              id
              name
              slug
              type

              thumb
              description
              author {
                id
                name
                slug
              }
              genres {
                id
                name
                slug
              }
            }
            imageUrls
          }
        }
      `,
      variables: {
        where: {
          name: {
            equals: parseInt(name as string),
          },
          comic: {
            slug: {
              equals: slug,
            },
          },
        },
      },
    });

  if (!findFirstChapter && name != undefined) {
    client
      .query({
        query: gql`
          mutation ReportMissingChapter($data: String!, $context: String!) {
            reportMissing(data: $data, context: $context)
          }
        `,

        variables: {
          context: "chapter",
          data: `${slug}-${name}`,
        },
      })
      .then(() =>
        console.log(
          `404 chapter ${name}-${slug} referrer ${context.req.headers.referer}`
        )
      );
  }

  if (findFirstChapter?.id) {
    client.query({
      query: gql`
        mutation ReportViewChapter($reportViewId: Int!, $context: String!) {
          reportView(id: $reportViewId, context: $context)
        }
      `,
      variables: {
        reportViewId: findFirstChapter.id,
        context: "chapter",
      },
    });
  }

  if (errorChapter) {
    console.log(errorChapter);
  }

  const { data: { findManyAds } = {} } = await client.query<{
    findManyAds: AdsType[];
  }>({
    query: gql`
      query FindHomeAds($where: AdsWhereInput) {
        findManyAds(where: $where) {
          id
          name
          position
          image
          url
          createdAt
          index
          updatedAt
        }
      }
    `,
    variables: {
      where: {
        position: {
          hasSome: ["CHAPTER_TOP", "CHAPTER_BOTTOM"],
        },
      },
    },
  });

  const UPPER_ADS = findManyAds
    ?.filter((e) => e.position.includes(AdsPosition.Chapter_top))
    .sort((a, b) => a.index - b.index);
  const BOTTOM_ADS = findManyAds
    ?.filter((e) => e.position.includes(AdsPosition.Chapter_bottom))
    .sort((a, b) => a.index - b.index);

  return {
    notFound: !findFirstChapter,
    props: {
      chapter: findFirstChapter,
      UPPER_ADS,
      BOTTOM_ADS,
    },
  };
};

export default Id;
