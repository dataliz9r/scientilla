SELECT
  (
    SELECT count(DISTINCT d.id)
    FROM document d
      LEFT JOIN authorship a
        ON d.id = a.document
      LEFT JOIN authorshipgroup ag
        ON d.id = ag.document
    WHERE a."researchEntity" IS NOT NULL OR ag."researchEntity" IS NOT NULL
  ) AS verified_documents_by_authorship,
  (
    SELECT count(DISTINCT d.id)
    FROM document d
      LEFT JOIN discarded_document a
        ON d.id = a.document
      LEFT JOIN discardedgroup ag
        ON d.id = ag.document
    WHERE a."researchEntity" IS NOT NULL OR ag."researchEntity" IS NOT NULL
  ) AS discarded_documents,
  (
    SELECT count(*)
    FROM document d
    WHERE kind = 'v'
  ) AS verified_documents_by_kind,
  (
    SELECT count(*)
    FROM authorship a
    WHERE "researchEntity" IS NOT NULL
  ) AS verifications_by_users,
  (
    SELECT count(*)
    FROM authorshipgroup ag
    WHERE "researchEntity" IS NOT NULL
  ) AS verifications_by_groups,
  (
    SELECT count(*)
    FROM document d
    WHERE kind = 'd'
  ) AS drafts_by_kind,
  (SELECT count(*)
   FROM document d
   WHERE kind = 'd' AND "draftCreator" IS NULL AND "draftGroupCreator" IS NULL
         AND NOT exists(SELECT id
                        FROM authorship a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
         AND NOT exists(SELECT id
                        FROM authorshipgroup a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
         AND NOT exists(SELECT id
                        FROM externaldocument a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
         AND NOT exists(SELECT id
                        FROM externaldocumentgroup a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
         AND NOT exists(SELECT id
                        FROM discarded_document a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
         AND NOT exists(SELECT id
                        FROM discardedgroup a
                        WHERE a.document = d.id AND a."researchEntity" IS NOT NULL)
  ) AS draft_with_errors,
  (
    SELECT count(*)
    FROM document d
    WHERE kind = 'e'
  ) AS external_documents_by_kind,
  (
    SELECT count(DISTINCT a.id)
    FROM authorship a
    WHERE "researchEntity" IS NOT NULL
          AND NOT exists(
        SELECT *
        FROM affiliation af
        WHERE af.authorship = a.id
    )
  ) AS authorship_without_affiliations,
  (
    SELECT count(*)
    FROM affiliation a
  ) AS affiliations,
  (
    SELECT count(DISTINCT source)
    FROM document
  ) AS used_sources,
  (
    SELECT count(DISTINCT affiliation.institute)
    FROM affiliation
  ) AS used_institutes,
  (
    SELECT count(*)
    FROM membership
  ) AS memberships,
  (
    SELECT count(*)
    FROM groupadministrator
  ) AS administrators,
  (
    SELECT count(*)
    FROM "group"
  ) AS groups,
  (
    SELECT count(*)
    FROM "user"
  ) AS users,
  (
    SELECT count(DISTINCT u.id)
    FROM "user" u
      JOIN authorship a
        ON u.id = a."researchEntity"
  ) AS users_with_verified_documents,
  (
    SELECT count(DISTINCT g.id)
    FROM "group" g
      JOIN authorshipgroup a
        ON g.id = a."researchEntity"
  ) AS groups_with_verified_documents,
  (
    SELECT count(d.id)
    FROM document d
      JOIN authorship a ON d.id = a.document
    WHERE d.kind = 'v'
          AND a."researchEntity" IS NOT NULL
          AND a.position >= array_length(string_to_array(d."authorsStr", ','), 1)
  ) AS authorship_with_position_higher_than_authors_count,
  (
    SELECT count(*)
    FROM (
           SELECT DISTINCT
             (string_to_array(d."authorsStr", ', ')) [a.position + 1],
             a."researchEntity",
             d.title
           FROM document d
             JOIN authorship a ON d.id = a.document
           WHERE d.kind = 'v'
                 AND a."researchEntity" IS NOT NULL
                 AND NOT exists(
               SELECT id
               FROM alias al
               WHERE al.user = a."researchEntity"
                     AND (string_to_array(d."authorsStr", ', ')) [a.position + 1] ILIKE al.str
           )
         ) AS a
  ) AS document_verified_by_user_without_correct_alias;