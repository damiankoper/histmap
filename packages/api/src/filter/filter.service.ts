import { Injectable } from '@nestjs/common';
import { Publication } from 'pre-processor';

@Injectable()
export class FilterService {
  filterPublications(publications: Publication[]) {
    return publications;
  }
}
