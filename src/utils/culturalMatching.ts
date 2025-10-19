import { User, UserProfile, CulturalMatchInfo } from "../types/user";

export class CulturalMatchingEngine {
  // Kitap türleri ve ağırlıkları
  private static readonly GENRE_WEIGHTS = {
    Roman: 1.0,
    "Bilim Kurgu": 0.9,
    Fantastik: 0.9,
    Felsefi: 1.2,
    Psikoloji: 1.1,
    Sosyoloji: 1.1,
    Tarih: 1.0,
    Biyografi: 0.8,
    Polisiye: 0.7,
    Şiir: 1.3,
    Deneme: 1.2,
    Sanat: 1.0,
    "Kişisel Gelişim": 0.6,
    Teknoloji: 0.8,
    Seyahat: 0.5,
    "Çizgi Roman": 0.6,
  };

  // İlgi alanları kategorileri ve ağırlıkları
  private static readonly INTEREST_CATEGORIES = {
    intellectual: {
      interests: [
        "Yazma",
        "Felsefe",
        "Tarih",
        "Sanat",
        "Müzik",
        "Tiyatro",
        "Sinema",
      ],
      weight: 1.5,
    },
    creative: {
      interests: ["Resim", "Fotoğrafçılık", "El Sanatları", "Müzik", "Dans"],
      weight: 1.2,
    },
    social: {
      interests: ["Gönüllülük", "Sosyal Aktiviteler", "Toplum Projesi"],
      weight: 1.1,
    },
    wellness: {
      interests: ["Yoga", "Meditasyon", "Spor", "Doğa"],
      weight: 0.8,
    },
    learning: {
      interests: ["Dil Öğrenme", "Araştırma", "Teknoloji", "Bilim"],
      weight: 1.3,
    },
    lifestyle: {
      interests: ["Seyahat", "Yemek", "Bahçıvanlık", "Koleksiyonculuk"],
      weight: 0.7,
    },
  };

  // Ünlü yazarlar ve etki seviyeleri
  private static readonly AUTHOR_INFLUENCE = {
    "Orhan Pamuk": 1.5,
    "Sabahattin Ali": 1.4,
    "Nazım Hikmet": 1.4,
    "Yaşar Kemal": 1.3,
    "Ahmet Hamdi Tanpınar": 1.4,
    "Oğuz Atay": 1.5,
    "Franz Kafka": 1.6,
    "Milan Kundera": 1.5,
    "Gabriel García Márquez": 1.5,
    "Jorge Luis Borges": 1.6,
    "Fyodor Dostoevsky": 1.6,
    "Virginia Woolf": 1.5,
    "James Joyce": 1.7,
    "Italo Calvino": 1.5,
    "Albert Camus": 1.6,
    "Jean-Paul Sartre": 1.5,
  };

  /**
   * İki kullanıcı arasındaki kültürel uyumu hesaplar
   */
  static calculateCulturalMatch(
    currentUser: User,
    targetUser: User
  ): CulturalMatchInfo {
    const currentProfile = currentUser.profile;
    const targetProfile = targetUser.profile;

    if (!currentProfile || !targetProfile) {
      return this.getDefaultMatch();
    }

    // 1. Tür uyumluluğu
    const genreMatch = this.calculateGenreMatch(
      currentProfile.favoriteGenres,
      targetProfile.favoriteGenres
    );

    // 2. İlgi alanı uyumluluğu
    const interestMatch = this.calculateInterestMatch(
      currentProfile.interests,
      targetProfile.interests
    );

    // 3. Yazar uyumluluğu
    const authorMatch = this.calculateAuthorMatch(
      currentProfile.favoriteAuthors,
      targetProfile.favoriteAuthors
    );

    // 4. Entelektüel uyumluluk
    const intellectualMatch = this.calculateIntellectualCompatibility(
      currentProfile,
      targetProfile
    );

    // 5. Okuma deseni benzerliği
    const readingPattern = this.calculateReadingPatternSimilarity(
      currentProfile,
      targetProfile
    );

    // Genel skor hesaplama (ağırlıklı ortalama)
    const overallScore =
      Math.round(
        (genreMatch.score * 0.25 +
          interestMatch.score * 0.3 +
          authorMatch.score * 0.2 +
          intellectualMatch * 0.15 +
          readingPattern * 0.1) *
          100
      ) / 100;

    // Eşleşme nedenlerini toplama
    const matchReasons: string[] = [];
    if (genreMatch.common.length > 0) {
      matchReasons.push(`📚 ${genreMatch.common.length} ortak kitap türü`);
    }
    if (interestMatch.common.length > 0) {
      matchReasons.push(`🎯 ${interestMatch.common.length} ortak ilgi alanı`);
    }
    if (authorMatch.common.length > 0) {
      matchReasons.push(`✍️ ${authorMatch.common.length} ortak sevilen yazar`);
    }
    if (intellectualMatch > 0.7) {
      matchReasons.push(`🧠 Benzer entelektüel seviye`);
    }
    if (readingPattern > 0.6) {
      matchReasons.push(`📖 Benzer okuma tercihleri`);
    }

    // Öneri seviyesi belirleme
    let recommendationLevel: "high" | "medium" | "low" = "low";
    if (overallScore >= 0.75) recommendationLevel = "high";
    else if (overallScore >= 0.5) recommendationLevel = "medium";

    return {
      overallScore,
      genreMatchScore: genreMatch.score,
      interestMatchScore: interestMatch.score,
      authorMatchScore: authorMatch.score,
      intellectualCompatibility: intellectualMatch,
      readingPatternSimilarity: readingPattern,
      matchReasons,
      recommendationLevel,
    };
  }

  /**
   * Kitap türü uyumluluğunu hesaplar
   */
  private static calculateGenreMatch(genres1: string[], genres2: string[]) {
    const common = genres1.filter((g) => genres2.includes(g));
    const total = new Set([...genres1, ...genres2]).size;

    if (total === 0) return { score: 0, common: [] };

    // Ağırlıklı hesaplama
    let weightedScore = 0;

    common.forEach((genre) => {
      const weight =
        this.GENRE_WEIGHTS[genre as keyof typeof this.GENRE_WEIGHTS] || 1.0;
      weightedScore += weight;
    });

    const score =
      total > 0 ? weightedScore / Math.max(genres1.length, genres2.length) : 0;

    return {
      score: Math.min(score, 1.0),
      common,
    };
  }

  /**
   * İlgi alanı uyumluluğunu hesaplar
   */
  private static calculateInterestMatch(
    interests1: string[],
    interests2: string[]
  ) {
    const common = interests1.filter((i) => interests2.includes(i));

    if (common.length === 0) return { score: 0, common: [] };

    // Kategori bazlı ağırlıklı hesaplama
    let totalScore = 0;
    let maxPossibleScore = 0;

    Object.values(this.INTEREST_CATEGORIES).forEach((category) => {
      const category1 = interests1.filter((i) =>
        category.interests.includes(i)
      );
      const category2 = interests2.filter((i) =>
        category.interests.includes(i)
      );
      const categoryCommon = category1.filter((i) => category2.includes(i));

      if (categoryCommon.length > 0) {
        totalScore += categoryCommon.length * category.weight;
      }

      maxPossibleScore +=
        Math.max(category1.length, category2.length) * category.weight;
    });

    const score = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

    return {
      score: Math.min(score, 1.0),
      common,
    };
  }

  /**
   * Yazar uyumluluğunu hesaplar
   */
  private static calculateAuthorMatch(authors1: string[], authors2: string[]) {
    const common = authors1.filter((a) => authors2.includes(a));

    if (common.length === 0) return { score: 0, common: [] };

    // Yazar etkisi bazlı ağırlıklı hesaplama
    let weightedScore = 0;
    let maxWeight = 0;

    common.forEach((author) => {
      const influence =
        this.AUTHOR_INFLUENCE[author as keyof typeof this.AUTHOR_INFLUENCE] ||
        1.0;
      weightedScore += influence;
    });

    const allAuthors = new Set([...authors1, ...authors2]);
    allAuthors.forEach((author) => {
      const influence =
        this.AUTHOR_INFLUENCE[author as keyof typeof this.AUTHOR_INFLUENCE] ||
        1.0;
      maxWeight += influence;
    });

    const score = maxWeight > 0 ? (weightedScore / maxWeight) * 2 : 0; // *2 çünkü ortak yazarlar daha önemli

    return {
      score: Math.min(score, 1.0),
      common,
    };
  }

  /**
   * Entelektüel uyumluluğu hesaplar
   */
  private static calculateIntellectualCompatibility(
    profile1: UserProfile,
    profile2: UserProfile
  ): number {
    let score = 0;
    let factors = 0;

    // Entelektüel türlerin varlığı
    const intellectualGenres = [
      "Felsefi",
      "Psikoloji",
      "Sosyoloji",
      "Şiir",
      "Deneme",
    ];
    const profile1Intellectual = profile1.favoriteGenres.filter((g) =>
      intellectualGenres.includes(g)
    );
    const profile2Intellectual = profile2.favoriteGenres.filter((g) =>
      intellectualGenres.includes(g)
    );

    if (profile1Intellectual.length > 0 && profile2Intellectual.length > 0) {
      score += 0.4;
    }
    factors++;

    // Entelektüel ilgi alanları
    const intellectualInterests =
      this.INTEREST_CATEGORIES.intellectual.interests;
    const profile1IntellectualInterests = profile1.interests.filter((i) =>
      intellectualInterests.includes(i)
    );
    const profile2IntellectualInterests = profile2.interests.filter((i) =>
      intellectualInterests.includes(i)
    );

    if (
      profile1IntellectualInterests.length > 0 &&
      profile2IntellectualInterests.length > 0
    ) {
      score += 0.3;
    }
    factors++;

    // Biyografi varlığı
    if (profile1.intellectualBio && profile2.intellectualBio) {
      const bio1Length = profile1.intellectualBio.length;
      const bio2Length = profile2.intellectualBio.length;

      // Benzer biyografi uzunlukları entelektüel benzerlik gösterir
      const lengthSimilarity =
        1 -
        Math.abs(bio1Length - bio2Length) / Math.max(bio1Length, bio2Length);
      score += lengthSimilarity * 0.3;
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Okuma deseni benzerliğini hesaplar
   */
  private static calculateReadingPatternSimilarity(
    profile1: UserProfile,
    profile2: UserProfile
  ): number {
    let score = 0;
    let factors = 0;

    // Tür çeşitliliği benzerliği
    const diversity1 = profile1.favoriteGenres.length;
    const diversity2 = profile2.favoriteGenres.length;
    const diversityScore =
      1 -
      Math.abs(diversity1 - diversity2) / Math.max(diversity1, diversity2, 1);
    score += diversityScore;
    factors++;

    // Yazar sayısı benzerliği
    const authorCount1 = profile1.favoriteAuthors.length;
    const authorCount2 = profile2.favoriteAuthors.length;
    const authorScore =
      1 -
      Math.abs(authorCount1 - authorCount2) /
        Math.max(authorCount1, authorCount2, 1);
    score += authorScore;
    factors++;

    // İlgi alanı çeşitliliği
    const interestDiversity1 = profile1.interests.length;
    const interestDiversity2 = profile2.interests.length;
    const interestScore =
      1 -
      Math.abs(interestDiversity1 - interestDiversity2) /
        Math.max(interestDiversity1, interestDiversity2, 1);
    score += interestScore;
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Varsayılan eşleşme bilgisi
   */
  private static getDefaultMatch(): CulturalMatchInfo {
    return {
      overallScore: 0,
      genreMatchScore: 0,
      interestMatchScore: 0,
      authorMatchScore: 0,
      intellectualCompatibility: 0,
      readingPatternSimilarity: 0,
      matchReasons: [],
      recommendationLevel: "low",
    };
  }

  /**
   * Eşleşme kalitesine göre kullanıcıları sıralar
   */
  static sortUsersByMatch(currentUser: User, users: User[]): User[] {
    return users
      .map((user) => ({
        user,
        match: this.calculateCulturalMatch(currentUser, user),
      }))
      .sort((a, b) => b.match.overallScore - a.match.overallScore)
      .map((item) => item.user);
  }

  /**
   * Öneri metinleri oluşturur
   */
  static generateMatchExplanation(match: CulturalMatchInfo): string[] {
    const explanations: string[] = [];

    if (match.recommendationLevel === "high") {
      explanations.push(
        "🌟 Yüksek uyumluluk! Bu kişiyle harika kitap sohbetleri yapabilirsiniz."
      );
    } else if (match.recommendationLevel === "medium") {
      explanations.push(
        "💫 Orta seviye uyumluluk. Yeni bakış açıları keşfedebilirsiniz."
      );
    }

    if (match.genreMatchScore > 0.6) {
      explanations.push("📚 Benzer kitap türlerini seviyorsunuz.");
    }

    if (match.intellectualCompatibility > 0.7) {
      explanations.push("🧠 Entelektüel seviyeniz uyumlu görünüyor.");
    }

    if (match.authorMatchScore > 0.5) {
      explanations.push("✍️ Ortak sevdiğiniz yazarlar var.");
    }

    return explanations;
  }
}
