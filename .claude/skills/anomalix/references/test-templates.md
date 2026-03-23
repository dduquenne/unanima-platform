# Templates de Tests Anti-Regression (Vitest / Jest)

## Structure de test recommandee

```typescript
/**
 * Tests anti-regression pour [NOM DE L'ANOMALIE]
 * Anomalie detectee le [DATE] -- Corrigee dans [FICHIER]
 *
 * Contexte : [Description du bug en une phrase]
 */
describe('[Module].[Fonction]', () => {

  // Cas nominal (happy path)
  it('retourne la valeur attendue pour une entree valide', () => {
    const result = myFunction({ id: '1', value: 42 });
    expect(result).toEqual({ processed: true, total: 42 });
  });

  // Cas limite (edge cases)
  it('gere une valeur null sans lever d\'exception', () => {
    expect(() => myFunction(null)).not.toThrow();
    expect(myFunction(null)).toBeNull();
  });

  it('gere un tableau vide', () => {
    expect(myFunction([])).toEqual([]);
  });

  // Cas de regression (le bug exact)
  it('ne crash pas quand [condition du bug]', () => {
    const badInput = { id: undefined, value: 'not-a-number' };
    expect(() => myFunction(badInput as any)).not.toThrow();
  });

  // Cas de securite si pertinent
  it('rejette les entrees malformees', () => {
    expect(() => myFunction({ id: '<script>alert(1)</script>' }))
      .toThrow('Invalid input');
  });
});
```

## Tests pour les cas async

```typescript
describe('fetchUserProfile', () => {

  it('retourne le profil pour un utilisateur valide', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await fetchUserProfile('user-123');

    expect(result).toMatchObject({ id: 'user-123', name: expect.any(String) });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });
  });

  it('retourne null pour un utilisateur inexistant (pas d\'exception)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await fetchUserProfile('ghost-id');

    expect(result).toBeNull();
  });

  it('propage l\'erreur de base de donnees avec le bon message', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Connection timeout')
    );

    await expect(fetchUserProfile('user-123')).rejects.toThrow('Connection timeout');
  });
});
```
