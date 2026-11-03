import { NextResponse } from 'next/server';
import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { adminUpdateCmsPageSchema, createCmsPageSchema } from '../../../../http/validation';
import { UnauthorizedError } from '../../../../domain/errors';
import {
  createOrPublishCmsPageInAdmin,
  updateCmsPageInAdmin
} from '../../../../lib/cms/service';

export const GET = createApiHandler({
  auth: true,
  admin: true,
  handler: async ({ authContext }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');
    const pages = await container.cmsService.listAllForAdmin(authContext);
    return { pages };
  }
});

export const POST = createApiHandler({
  auth: true,
  admin: true,
  bodySchema: createCmsPageSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');
    const page = await container.cmsService.createPage(authContext, body as any);
    try {
      createOrPublishCmsPageInAdmin({ ...body, id: page.id } as any);
    } catch {
      // sync
    }
    return NextResponse.json({ page }, { status: 201 });
  }
});

export const PUT = createApiHandler({
  auth: true,
  admin: true,
  bodySchema: adminUpdateCmsPageSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');

    const page = await container.cmsService.updatePage(authContext, body.pageId, body.patch);
    try {
      updateCmsPageInAdmin(body.pageId, body.patch);
    } catch {
      // sync
    }
    return { page };
  }
});
