/**
 * Service de gestion de contenu CMS & SEO (Couche Métier).
 * Design Pattern : Dependency Injection & Port/Adapter.
 * - Gabarit SEO complet (h1, chapo, faq, sources, author, reviewer, verifiedAt).
 * - Redirection 301 automatique lors de la modification d'un slug par l'admin (§7 Lot 6 CA #2).
 */

import { AuthContext, CmsPage, CmsPageInput } from '../domain/models';
import { ForbiddenError, NotFoundError } from '../domain/errors';
import { ICmsRepository } from '../repositories/interfaces';

export class CmsService {
  constructor(private readonly cmsRepo: ICmsRepository) {}

  /**
   * Résout une page publique. `targetSlug` est renvoyé SANS slash initial.
   * Les brouillons ne sont servis que si `includeDrafts` est demandé (prévisualisation admin).
   */
  async getPageBySlug(
    slug: string,
    options: { includeDrafts?: boolean } = {}
  ): Promise<{ type: 'page'; page: CmsPage } | { type: 'redirect'; targetSlug: string }> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const page = await this.cmsRepo.findBySlug(cleanSlug);

    if (page && page.status === 'published') {
      return { type: 'page', page };
    }

    // Recherche d'une redirection 301 existante (§7 Lot 6 CA #2)
    const redirectTarget = await this.cmsRepo.getRedirect(cleanSlug);
    const targetSlug = redirectTarget?.replace(/^\/+|\/+$/g, '');
    if (targetSlug && targetSlug !== cleanSlug) {
      return { type: 'redirect', targetSlug };
    }

    if (page && page.status === 'draft' && options.includeDrafts) {
      return { type: 'page', page };
    }

    throw new NotFoundError(`Page CMS introuvable pour le slug '${cleanSlug}'`);
  }

  async listPublishedPages(): Promise<CmsPage[]> {
    return await this.cmsRepo.listPublished();
  }

  async listAllForAdmin(authContext: AuthContext): Promise<CmsPage[]> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }
    return await this.cmsRepo.listAll();
  }

  async createPage(authContext: AuthContext, input: CmsPageInput): Promise<CmsPage> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }
    const cleanSlug = input.slug.replace(/^\/+|\/+$/g, '');
    return await this.cmsRepo.create({
      ...input,
      slug: cleanSlug
    });
  }

  async updatePage(
    authContext: AuthContext,
    id: string,
    patch: Partial<CmsPageInput>
  ): Promise<CmsPage> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }

    // Récupérer l'ancienne version pour vérifier si le slug a changé
    const all = await this.cmsRepo.listAll();
    const existing = all.find((p) => p.id === id);

    if (!existing) {
      throw new NotFoundError(`Page introuvable pour l'identifiant ${id}`);
    }

    if (patch.slug) {
      const cleanNewSlug = patch.slug.replace(/^\/+|\/+$/g, '');
      if (existing.slug !== cleanNewSlug) {
        // Enregistrer la redirection 301 permanente (§7 Lot 6 CA #2)
        await this.cmsRepo.recordRedirect(existing.slug, cleanNewSlug);
        patch.slug = cleanNewSlug;
      }
    }

    return await this.cmsRepo.update(id, patch);
  }
}

