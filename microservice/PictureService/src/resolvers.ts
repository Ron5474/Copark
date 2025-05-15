import { PictureResolver } from "./picture/resolver"
import { DummyQueryResolver } from "./picture/resolver"
export const resolvers = [PictureResolver, DummyQueryResolver ] as const;
