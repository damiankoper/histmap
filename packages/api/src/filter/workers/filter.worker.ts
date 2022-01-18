import { fuzzy } from 'fast-fuzzy';
import { Publication } from 'pre-processor';
import { TileOptionsDto } from 'src/tiles/dto/tile-options.dto';
import { worker } from 'workerpool';

function splitAndTrim(clause: string): string[] {
  return clause
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length);
}

function filterPublications(
  publicationIds: number[],
  publications: Publication[],
  options: TileOptionsDto,
) {
  return publicationIds.filter((_, i) => {
    const pub = publications.at(i);

    const title =
      !options.title.length ||
      (pub.title.length &&
        fuzzy(pub.title, options.title, { ignoreCase: true }) > 0.5);

    let authorBool = !options.author.length || false;
    splitAndTrim(pub.author).forEach((author) => {
      const authorFuzzy =
        !options.author.length ||
        (author.length && fuzzy(author, options.author) > 0.5);

      authorBool = authorBool || authorFuzzy;
    });

    let pubPlaceBool = !options.place.length || false;
    splitAndTrim(pub.publicationPlace).forEach((place) => {
      const pubPlaceFuzzy =
        !options.place.length ||
        (place.length && fuzzy(place, options.place) > 0.5);

      pubPlaceBool = pubPlaceBool || pubPlaceFuzzy;
    });

    return title && authorBool && pubPlaceBool;
  });
}

worker({ filterPublications });
