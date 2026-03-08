declare module 'hpp' {
  import { RequestHandler } from 'express';

  type HppOptions = {
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string;
    checkQuery?: boolean;
    whitelist?: string[];
  };

  function hpp(options?: HppOptions): RequestHandler;

  export default hpp;
}
