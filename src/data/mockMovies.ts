import { Movie, EpisodeServer, Category, Country } from '../types/movie';

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
  { id: '2', name: 'Tình Cảm', slug: 'tinh-cam' },
  { id: '3', name: 'Kinh Dị', slug: 'kinh-di' },
  { id: '4', name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { id: '5', name: 'Khoa Học Viễn Tưởng', slug: 'vien-tuong' },
  { id: '6', name: 'Hài Hước', slug: 'hai-huoc' },
  { id: '7', name: 'Cổ Trang', slug: 'co-trang' },
  { id: '8', name: 'Tâm Lý', slug: 'tam-ly' }
];

export const MOCK_COUNTRIES: Country[] = [
  { id: 'kr', name: 'Hàn Quốc', slug: 'han-quoc' },
  { id: 'cn', name: 'Trung Quốc', slug: 'trung-quoc' },
  { id: 'th', name: 'Thái Lan', slug: 'thai-lan' },
  { id: 'us', name: 'Âu Mỹ', slug: 'au-my' },
  { id: 'jp', name: 'Nhật Bản', slug: 'nhat-ban' },
  { id: 'vn', name: 'Việt Nam', slug: 'viet-nam' }
];

export interface DetailedMovie {
  movie: Movie;
  episodes: EpisodeServer[];
}

export const MOCK_MOVIES: DetailedMovie[] = [
  {
    movie: {
      name: 'Dune: Hành Tinh Cát - Phần 2',
      slug: 'dune-hanh-tinh-cat-phan-2',
      origin_name: 'Dune: Part Two',
      content: 'Dune: Part Two sẽ khám phá hành trình tiếp theo của Paul Atreides khi anh hợp lực với Chani và người Fremen để trả thù những kẻ đã hủy hoại gia đình mình. Đối mặt với sự lựa chọn giữa tình yêu của đời mình và số phận của vũ trụ được biết đến, anh nỗ lực ngăn chặn một tương lai khủng khiếp mà chỉ mình anh có thể thấy trước.',
      type: 'single',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60',
      year: 2024,
      view: 185620,
      actor: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin', 'Austin Butler', 'Florence Pugh'],
      director: ['Denis Villeneuve'],
      category: [{ id: '1', name: 'Hành Động', slug: 'hanh-dong' }, { id: '5', name: 'Khoa Học Viễn Tưởng', slug: 'vien-tuong' }],
      country: [{ id: 'us', name: 'Âu Mỹ', slug: 'au-my' }],
      time: '166 phút',
      episode_current: 'Full',
      episode_total: '1 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '8.6', vote: 420000 }
    },
    episodes: [
      {
        server_name: 'Server VIP',
        server_data: [
          {
            name: 'Full',
            slug: 'full',
            filename: 'dune_part_2_full.mp4',
            link_embed: 'https://www.youtube.com/embed/U2Qp5pL3ovA',
            link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Spider-Man: Du Hành Vũ Trụ Nhện',
      slug: 'spider-man-du-hanh-vu-tru-nhen',
      origin_name: 'Spider-Man: Across the Spider-Verse',
      content: 'Sau khi hội ngộ với Gwen Stacy, chàng Nhện thân thiện thân thiện của Brooklyn Miles Morales bị dịch chuyển qua Đa vũ trụ, nơi anh gặp một nhóm Người Nhện chịu trách nhiệm bảo vệ sự tồn tại của các thế giới. Nhưng khi những người hùng xung đột về cách xử lý mối đe dọa mới, Miles phải định nghĩa lại ý nghĩa của việc trở thành một anh hùng.',
      type: 'single',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=60',
      year: 2023,
      view: 245000,
      actor: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson', 'Issa Rae'],
      director: ['Joaquim Dos Santos', 'Kemp Powers'],
      category: [{ id: '1', name: 'Hành Động', slug: 'hanh-dong' }, { id: '4', name: 'Hoạt Hình', slug: 'hoat-hinh' }],
      country: [{ id: 'us', name: 'Âu Mỹ', slug: 'au-my' }],
      time: '140 phút',
      episode_current: 'Full',
      episode_total: '1 tập',
      lang: 'Thuyết Minh',
      quality: 'FHD',
      imdb: { star: '8.7', vote: 350000 }
    },
    episodes: [
      {
        server_name: 'Server VIP',
        server_data: [
          {
            name: 'Full',
            slug: 'full',
            filename: 'spiderman_across_spiderverse.mp4',
            link_embed: 'https://www.youtube.com/embed/cqGjhVJWtEg',
            link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Nữ Thần Thứ Tư (Wednesday) - Phần 1',
      slug: 'nu-than-thu-tu-wednesday-phan-1',
      origin_name: 'Wednesday: Season 1',
      content: 'Một bộ phim bí ẩn, siêu nhiên kể về những năm tháng làm học sinh của Wednesday Addams tại Học viện Nevermore. Cô cố gắng làm chủ khả năng ngoại cảm mới xuất hiện của mình, ngăn chặn một vụ giết người tàn bạo đang khủng bố thị trấn địa phương và giải quyết bí ẩn siêu nhiên từng ảnh hưởng đến cha mẹ cô 25 năm trước.',
      type: 'series',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      year: 2022,
      view: 512000,
      actor: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome', 'Christina Ricci', 'Jamie McShane'],
      director: ['Tim Burton'],
      category: [{ id: '3', name: 'Kinh Dị', slug: 'kinh-di' }, { id: '6', name: 'Hài Hước', slug: 'hai-huoc' }],
      country: [{ id: 'us', name: 'Âu Mỹ', slug: 'au-my' }],
      time: '45 phút / tập',
      episode_current: 'Tập 8',
      episode_total: '8 tập',
      lang: 'Vietsub + Thuyết Minh',
      quality: 'FHD',
      imdb: { star: '8.1', vote: 340000 }
    },
    episodes: [
      {
        server_name: 'Server PRO',
        server_data: [
          { name: '1', slug: 'tap-1', filename: 'wednesday_e01.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { name: '2', slug: 'tap-2', filename: 'wednesday_e02.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { name: '3', slug: 'tap-3', filename: 'wednesday_e03.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { name: '4', slug: 'tap-4', filename: 'wednesday_e04.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
          { name: '5', slug: 'tap-5', filename: 'wednesday_e05.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { name: '6', slug: 'tap-6', filename: 'wednesday_e06.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
          { name: '7', slug: 'tap-7', filename: 'wednesday_e07.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
          { name: '8', slug: 'tap-8', filename: 'wednesday_e08.mp4', link_embed: 'https://www.youtube.com/embed/Di310WS8zLk', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Khóa Chặt Cửa Nào Suzume',
      slug: 'khoa-chat-cua-nao-suzume',
      origin_name: 'Suzume no Tojimari',
      content: 'Suzume, một cô gái 17 tuổi sống tại thị trấn yên tĩnh ở Kyushu, gặp một chàng trai trẻ đang tìm kiếm một cánh cửa. Hai người cùng nhau đi sâu vào những ngọn núi đổ nát và phát hiện ra một cánh cửa cũ kỹ đứng cô độc. Như bị dẫn dắt bởi một thế lực bí ẩn, Suzume chạm tay vào nắm cửa, và từ đó hàng loạt biến cố xảy ra khắp Nhật Bản.',
      type: 'single',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
      year: 2023,
      view: 195000,
      actor: ['Nanoka Hara', 'Hokuto Matsumura', 'Eri Fukatsu', 'Shota Sometani'],
      director: ['Makoto Shinkai'],
      category: [{ id: '4', name: 'Hoạt Hình', slug: 'hoat-hinh' }, { id: '2', name: 'Tình Cảm', slug: 'tinh-cam' }],
      country: [{ id: 'jp', name: 'Nhật Bản', slug: 'nhat-ban' }],
      time: '122 phút',
      episode_current: 'Full',
      episode_total: '1 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '7.8', vote: 45000 }
    },
    episodes: [
      {
        server_name: 'Anime Server',
        server_data: [
          {
            name: 'Full',
            slug: 'full',
            filename: 'suzume_no_tojimari.mp4',
            link_embed: 'https://www.youtube.com/embed/fD5t2J7t8kg',
            link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Tên Cậu Là Gì?',
      slug: 'ten-cau-la-gi',
      origin_name: 'Your Name.',
      content: 'Mitsuha là một cô nữ sinh trung học sống tại một vùng nông thôn yên bình của Nhật Bản, trong khi Taki là một cậu học sinh trung học sống ở thủ đô Tokyo tấp nập. Hai con người, hai thế giới xa lạ bỗng nhiên bị hoán đổi cơ thể cho nhau sau sự xuất hiện của một ngôi sao chổi huyền ảo. Họ bắt đầu tìm cách liên lạc và tìm kiếm nhau giữa ranh giới của không gian và thời gian.',
      type: 'single',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&auto=format&fit=crop&q=60',
      year: 2016,
      view: 320000,
      actor: ['Ryunosuke Kamiki', 'Mone Kamishiraishi', 'Ryo Narita'],
      director: ['Makoto Shinkai'],
      category: [{ id: '4', name: 'Hoạt Hình', slug: 'hoat-hinh' }, { id: '2', name: 'Tình Cảm', slug: 'tinh-cam' }],
      country: [{ id: 'jp', name: 'Nhật Bản', slug: 'nhat-ban' }],
      time: '106 phút',
      episode_current: 'Full',
      episode_total: '1 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '8.4', vote: 290000 }
    },
    episodes: [
      {
        server_name: 'Anime Server',
        server_data: [
          {
            name: 'Full',
            slug: 'full',
            filename: 'your_name.mp4',
            link_embed: 'https://www.youtube.com/embed/NooWeGeyXpI',
            link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Hạ Cánh Nơi Anh',
      slug: 'ha-canh-noi-anh',
      origin_name: 'Crash Landing on You',
      content: 'Yoon Se-ri là một người thừa kế giàu có của một tập đoàn lớn tại Hàn Quốc. Trong một chuyến bay dù lượn, một cơn gió lốc lớn đã cuốn cô qua biên giới Triều Tiên. Tại đây, cô gặp gỡ Ri Jeong-hyeok, một sĩ quan quân đội Triều Tiên cực kỳ nguyên tắc. Anh quyết định bảo vệ cô và bí mật đưa cô trở về nhà, mở ra một câu chuyện tình yêu đầy lãng mạn và thử thách.',
      type: 'series',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60',
      year: 2019,
      view: 395000,
      actor: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye', 'Kim Jung-hyun'],
      director: ['Lee Jung-hyo'],
      category: [{ id: '2', name: 'Tình Cảm', slug: 'tinh-cam' }, { id: '8', name: 'Tâm Lý', slug: 'tam-ly' }],
      country: [{ id: 'kr', name: 'Hàn Quốc', slug: 'han-quoc' }],
      time: '70 phút / tập',
      episode_current: 'Tập 16',
      episode_total: '16 tập',
      lang: 'Thuyết Minh',
      quality: 'FHD',
      imdb: { star: '8.7', vote: 15400 }
    },
    episodes: [
      {
        server_name: 'Server Gốc',
        server_data: [
          { name: '1', slug: 'tap-1', filename: 'cloy_e01.mp4', link_embed: 'https://www.youtube.com/embed/S_C18C8Iq7Y', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { name: '2', slug: 'tap-2', filename: 'cloy_e02.mp4', link_embed: 'https://www.youtube.com/embed/S_C18C8Iq7Y', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { name: '3', slug: 'tap-3', filename: 'cloy_e03.mp4', link_embed: 'https://www.youtube.com/embed/S_C18C8Iq7Y', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { name: '4', slug: 'tap-4', filename: 'cloy_e04.mp4', link_embed: 'https://www.youtube.com/embed/S_C18C8Iq7Y', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Trò Chơi Con Mực (Squid Game)',
      slug: 'tro-choi-con-muc',
      origin_name: 'Squid Game',
      content: 'Một nhóm gồm 456 người đang trải qua khủng hoảng kinh tế nghiêm trọng được mời tham gia một cuộc chơi sinh tử với giải thưởng kếch xù lên đến 45.6 tỷ Won. Tuy nhiên, cái giá phải trả cho việc thất bại trong các trò chơi dân gian thời thơ ấu này chính là mạng sống của họ. Ai sẽ là người cuối cùng giành chiến thắng và sống sót?',
      type: 'series',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&auto=format&fit=crop&q=60',
      year: 2021,
      view: 980000,
      actor: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon', 'Jung Ho-yeon'],
      director: ['Hwang Dong-hyuk'],
      category: [{ id: '1', name: 'Hành Động', slug: 'hanh-dong' }, { id: '3', name: 'Kinh Dị', slug: 'kinh-di' }],
      country: [{ id: 'kr', name: 'Hàn Quốc', slug: 'han-quoc' }],
      time: '60 phút / tập',
      episode_current: 'Tập 9',
      episode_total: '9 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '8.0', vote: 490000 }
    },
    episodes: [
      {
        server_name: 'Netflix Proxy',
        server_data: [
          { name: '1', slug: 'tap-1', filename: 'squid_e01.mp4', link_embed: 'https://www.youtube.com/embed/oqxAJKy0R4A', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { name: '2', slug: 'tap-2', filename: 'squid_e02.mp4', link_embed: 'https://www.youtube.com/embed/oqxAJKy0R4A', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { name: '3', slug: 'tap-3', filename: 'squid_e03.mp4', link_embed: 'https://www.youtube.com/embed/oqxAJKy0R4A', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Tinh Thần Khởi Nghiệp (Startup)',
      slug: 'tinh-than-khoi-nghiep',
      origin_name: 'Start-Up',
      content: 'Lấy bối cảnh ở Thung lũng Silicon giả tưởng của Hàn Quốc có tên là Sandbox, câu chuyện kể về những người trẻ tuổi đang tìm cách khởi nghiệp trong thế giới công nghệ cao. Seo Dal-mi có ước mơ trở thành Steve Jobs của Hàn Quốc, kết hợp cùng Nam Do-san, người sáng lập thiên tài của Samsan Tech nhưng đang gặp khó khăn trong kinh doanh.',
      type: 'series',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
      year: 2020,
      view: 185000,
      actor: ['Bae Suzy', 'Nam Joo-hyuk', 'Kim Seon-ho', 'Kang Han-na'],
      director: ['Oh Choong-hwan'],
      category: [{ id: '2', name: 'Tình Cảm', slug: 'tinh-cam' }, { id: '6', name: 'Hài Hước', slug: 'hai-huoc' }],
      country: [{ id: 'kr', name: 'Hàn Quốc', slug: 'han-quoc' }],
      time: '80 phút / tập',
      episode_current: 'Tập 16',
      episode_total: '16 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '8.0', vote: 9500 }
    },
    episodes: [
      {
        server_name: 'Netflix Server',
        server_data: [
          { name: '1', slug: 'tap-1', filename: 'startup_e01.mp4', link_embed: 'https://www.youtube.com/embed/Bem8G7gA638', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Vương Triều Xác Sống (Kingdom) - Phần 1',
      slug: 'vuong-trieu-xac-song-kingdom-phan-1',
      origin_name: 'Kingdom: Season 1',
      content: 'Thời Joseon, có tin đồn Hoàng đế mắc một căn bệnh bí ẩn khiến nhiều người lo sợ. Thái tử Lee Chang quyết định bí mật điều tra điều gì đang xảy ra với phụ hoàng của mình. Trong hành trình đó, anh khám phá ra một bệnh dịch thây ma khủng khiếp đang tàn phá bờ cõi Joseon, đe dọa trực tiếp sự tồn vong của vương triều.',
      type: 'series',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      year: 2019,
      view: 295000,
      actor: ['Ju Ji-hoon', 'Ryu Seung-ryong', 'Bae Doona'],
      director: ['Kim Seong-hun'],
      category: [{ id: '1', name: 'Hành Động', slug: 'hanh-dong' }, { id: '3', name: 'Kinh Dị', slug: 'kinh-di' }],
      country: [{ id: 'kr', name: 'Hàn Quốc', slug: 'han-quoc' }],
      time: '50 phút / tập',
      episode_current: 'Tập 6',
      episode_total: '6 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '8.4', vote: 48000 }
    },
    episodes: [
      {
        server_name: 'VIP Server',
        server_data: [
          { name: '1', slug: 'tap-1', filename: 'kingdom_e01.mp4', link_embed: 'https://www.youtube.com/embed/4S_8EskW_6M', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    ]
  },
  {
    movie: {
      name: 'Quỷ Cẩu (A Haunted Dog)',
      slug: 'quy-cau',
      origin_name: 'A Haunted Dog',
      content: 'Chuyện phim xoay quanh gia đình làm nghề mổ chó của Nam. Từ ngày Nam từ Sài Gòn quay về cùng bạn gái mang thai để dự đám tang của ba mình, anh bắt đầu mơ những giấc mơ kỳ lạ về một chú chó trắng mũi đỏ đe dọa gia đình mình. Kế đến là hàng loạt vụ án mạng kinh dị bêu đầu và treo thây xảy ra trong gia đình.',
      type: 'single',
      status: 'completed',
      thumb_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      poster_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&auto=format&fit=crop&q=60',
      year: 2023,
      view: 154000,
      actor: ['Quang Tuấn', 'Mie', 'NSND Kim Xuân', 'Vân Dung'],
      director: ['Lưu Thành Luân'],
      category: [{ id: '3', name: 'Kinh Dị', slug: 'kinh-di' }],
      country: [{ id: 'vn', name: 'Việt Nam', slug: 'viet-nam' }],
      time: '110 phút',
      episode_current: 'Full',
      episode_total: '1 tập',
      lang: 'Vietsub',
      quality: 'FHD',
      imdb: { star: '6.4', vote: 1200 }
    },
    episodes: [
      {
        server_name: 'Mirror 1',
        server_data: [
          { name: 'Full', slug: 'full', filename: 'quy_cau.mp4', link_embed: 'https://www.youtube.com/embed/5T5ZAtxI-t0', link_m3u8: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
        ]
      }
    ]
  }
];
