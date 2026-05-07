import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'places',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const p = (children: any[]) => ({ type: 'paragraph', children })
const text = (t: string, format?: number) => ({ type: 'text', text: t, ...(format ? { format } : {}) })
const bold = (t: string) => text(t, 1)
const italic = (t: string) => text(t, 2)
const h2 = (t: string) => ({ type: 'heading', tag: 'h2', children: [text(t)] })
const h3 = (t: string) => ({ type: 'heading', tag: 'h3', children: [text(t)] })
const richText = (children: any[]) => ({
  root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
})

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`— Clearing collections and globals...`)

  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: { navItems: [] },
        depth: 0,
        context: { disableRevalidate: true },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) =>
      payload.db.deleteMany({ collection, req, where: {} }).catch(() => {}),
    ),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection]?.config.versions))
      .map((collection) =>
        payload.db.deleteVersions({ collection, req, where: {} }).catch(() => {}),
      ),
  )

  payload.logger.info(`— Seeding media...`)

  const rawsonShopsBuffer = readLocalFile('rawson-shops.jpg')
  const ericaTownBuffer = readLocalFile('erica-township.jpg')
  const walhallaBuffer = readLocalFile('walhalla.jpg')

  const rawsonShopsImage = await payload.create({
    collection: 'media',
    data: { alt: 'Rawson Post Office and shops on a sunny day, with large green trees' },
    file: rawsonShopsBuffer,
  })
  const ericaTownImage = await payload.create({
    collection: 'media',
    data: { alt: 'Township of Erica, Victoria, looking down the main road with eucalypts and poplars' },
    file: ericaTownBuffer,
  })
  const walhallaImage = await payload.create({
    collection: 'media',
    data: { alt: 'Historic Walhalla township nestled in a forested gorge' },
    file: walhallaBuffer,
  })

  // ── Pages ──

  payload.logger.info(`— Seeding pages...`)

  const homePage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica & Rawson',
      slug: 'home',
      _status: 'published',
      hero: {
        type: 'highImpact',
        richText: richText([
          { type: 'heading', tag: 'h1', children: [text('Erica & Rawson')] },
          p([italic('Two townships, one community \u2014 in the heart of Gippsland\u2019s Mountain Rivers Region')]),
        ]),
        links: [],
        media: rawsonShopsImage.id,
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText([
                p([
                  text('Set in the valleys of dense Australian bush, the small townships of '),
                  bold('Erica and Rawson'),
                  text(' offer a glimpse into alpine life. They\u2019re the stepping-off points for 4WD adventures, epic hikes, mountain biking, and the gateway to snow country.'),
                ]),
              ]),
            },
          ],
        },
        {
          blockType: 'contentWithImage',
          image: rawsonShopsImage.id,
          imagePosition: 'left',
          richText: richText([
            h2('Rawson'),
            p([
              text('Rawson was established in 1977 for the families building the '),
              bold('Thomson Dam'),
              text('. When construction finished in 1983, the entire town was auctioned off \u2014 houses, buildings and all. Some workers and their families bought up and made it home. Today it\u2019s a quiet township of around 300 people with a General Store, Post Office, bottle shop, and the '),
              bold('Stockyard Hotel'),
              text(' for a real bush pub feed.'),
            ]),
            p([
              text('Walk the 500m loop around '),
              bold('Rawson Crater Lake'),
              text(' and spot rare birdlife, or take the '),
              bold('Mushroom Rocks Walk'),
              text(' (3km return, 2 hours) to see granite tors rising from the forest floor.'),
            ]),
          ]),
        },
        {
          blockType: 'contentWithImage',
          image: ericaTownImage.id,
          imagePosition: 'right',
          richText: richText([
            h2('Erica'),
            p([
              text('Discover the country charm of '),
              bold('Erica'),
              text(' and its genuinely old buildings still in use. The '),
              bold('Erica Hotel Motel'),
              text(' is a family-run country pub with hearty meals and a unique Bushman\u2019s Museum. Stop into the '),
              bold('Erica Caf\u00e9 & Bar'),
              text(' for cocktails and cake, or grab snow gear from '),
              bold('Erica Ski Hire'),
              text(' in winter.'),
            ]),
            p([
              text('Hit the 30+ kilometres of trails at the '),
              bold('Erica Mountain Bike Park'),
              text(' \u2014 tackle \u201cCrazy Snake\u201d, \u201cBones\u201d or \u201cAxeman\u201d. The nearby '),
              bold('Thomson River'),
              text(' offers kayaking and white water rafting.'),
            ]),
          ]),
        },
        {
          blockType: 'contentWithImage',
          image: walhallaImage.id,
          imagePosition: 'left',
          richText: richText([
            h2('Nearby'),
            p([
              text('Take a seat on the spectacular '),
              bold('Walhalla Goldfields Railway'),
              text(' through Stringer\u2019s Gorge. Explore gold-rush heritage in '),
              bold('Walhalla'),
              text(' \u2014 old tramways, a gold mine tour, ghost tours, and the Wally Pub.'),
            ]),
            p([
              text('Head up to '),
              bold('Mt Baw Baw'),
              text(' for skiing and boarding in winter, or mountain biking and bushwalks in the green season. '),
              bold('Mt St Gwinear'),
              text(' is an accessible snowfield with toboggan runs, perfect for families.'),
            ]),
            p([
              text('Over 150,000 visitors come to the Mountain Rivers region each year. Come and see why.'),
            ]),
          ]),
        },
      ],
      meta: {
        title: 'Erica and Rawson \u2014 Two Townships, One Community',
        description:
          'Erica and Rawson sit in the heart of Gippsland\u2019s Mountain Rivers Region. Your base for mountain biking, bushwalking, 4WD, skiing and exploring Walhalla.',
      },
    },
  })

  const rawsonPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Rawson',
      slug: 'rawson',
      _status: 'published',
      hero: {
        type: 'mediumImpact',
        richText: richText([
          { type: 'heading', tag: 'h1', children: [text('Rawson')] },
          p([italic('A modern township born from the Thomson Dam')]),
        ]),
        links: [],
        media: rawsonShopsImage.id,
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText([
                p([
                  text('Rawson (population ~300, postcode 3825) sits in the '),
                  bold('Shire of Baw Baw'),
                  text(', 171 km east of Melbourne and 37 km north of Moe along the Tyers\u2013Thomson Valley Road.'),
                ]),
                h2('History'),
                p([
                  text('Rawson was purpose-built in 1977 by the Melbourne and Metropolitan Board of Works to house the workers constructing the '),
                  bold('Thomson Dam'),
                  text(', Melbourne\u2019s largest water storage. At its peak the town held around 1,800 people \u2014 families in modern houses, 600 single workers in barracks, and a large caravan park. The rock for the dam wall came from a quarry developed on-site, with a crushing plant for concrete aggregate.'),
                ]),
                p([
                  text('Originally called Robertson (after chief engineer Alan Robertson), the name was changed to Rawson after local pressure, honouring a pioneer family. The post office opened 17 April 1979. Erica, just down the road with about 100 residents at the time, didn\u2019t want the upheaval of becoming a construction town \u2014 so the MMBW built a new one from scratch on flatter ground with sewerage and underground services.'),
                ]),
                p([
                  text('The dam was completed in May 1983, built on time and on budget. When construction wound down, the population crashed. The whole town was auctioned off \u2014 houses, facilities and all. A small community of workers and newcomers bought in and put down roots. As Wayne Healy, who drove the tunnel boring machine, remembered: '),
                  italic('\u201cThe Thomson was the best job ever.\u201d'),
                ]),
                h2('Things to do'),
                p([
                  text('Walk the 500m loop around '),
                  bold('Rawson Crater Lake'),
                  text(' and spot rare birdlife. Take the '),
                  bold('Mushroom Rocks Walk'),
                  text(' (3km return, 2 hours) to see granite tors rising from the forest floor. Visit the '),
                  bold('Thomson Dam'),
                  text(' lookout for panoramic views of the reservoir and surrounding ranges.'),
                ]),
                h2('Eat & drink'),
                p([
                  text('The '),
                  bold('Stockyard Hotel'),
                  text(' serves up a real bush pub dining experience. The '),
                  bold('Rawson Post Office and Mini Mart'),
                  text(' has take-away food, coffee, a bottle shop, camping gear and local craft.'),
                ]),
                h2('Services'),
                p([
                  text('Community Health Centre, Police Station, heated swimming pool, '),
                  bold('Rawson Primary School'),
                  text(' (established 1994), kindergarten, MTB and BMX tracks.'),
                ]),
                h2('Accommodation'),
                p([
                  bold('Mountain Rivers Tourist Park'),
                  text(' offers spa chalets, family chalets, alpine cabins, motel lodge, bunkhouse and campground. There are also Airbnb and holiday rental options in the area.'),
                ]),
                h2('Getting here'),
                p([
                  text('From Melbourne: take the M1/Princes Freeway east to Moe (~1.5 hours), then north on the Moe\u2013Rawson Road through Erica (~30\u201340 min). From the east: via Tyers and Thomson Valley Road.'),
                ]),
                p([
                  bold('Fuel warning: '),
                  text('No petrol or diesel is available in Rawson or Erica. Fill up in Moe, Morwell, Traralgon or Mansfield.'),
                ]),
              ]),
            },
          ],
        },
        {
          blockType: 'mapEmbed',
          latitude: -37.956389,
          longitude: 146.396944,
          zoom: 13,
          caption: 'Rawson, Victoria',
        },
      ],
    },
  })

  const ericaPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica',
      slug: 'erica',
      _status: 'published',
      hero: {
        type: 'mediumImpact',
        richText: richText([
          { type: 'heading', tag: 'h1', children: [text('Erica')] },
          p([italic('Country charm at the foothills of Mt Baw Baw')]),
        ]),
        links: [],
        media: ericaTownImage.id,
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText([
                p([
                  text('Erica sits at the foothills of '),
                  bold('Mt Baw Baw'),
                  text(' in Gippsland\u2019s Mountain Rivers Region. With genuinely old buildings still in daily use, it\u2019s a township with deep roots and real country character.'),
                ]),
                h2('Eat & drink'),
                p([
                  text('The '),
                  bold('Erica Hotel Motel'),
                  text(' is a family-run country pub with hearty meals made from fresh local produce and a unique Bushman\u2019s Museum featuring a chainsaw collection. Try a \u2018hot rock\u2019 steak.'),
                ]),
                p([
                  text('The '),
                  bold('Erica Caf\u00e9 & Bar'),
                  text(' serves cocktails and cake \u2014 a great spot to refuel after a day on the trails. The '),
                  bold('Erica General Store'),
                  text(' has food and supplies.'),
                ]),
                h2('Mountain biking'),
                p([
                  text('The '),
                  bold('Erica Mountain Bike Park'),
                  text(' has 30+ kilometres of trails for all levels. Fateful names like \u201cAxeman\u201d, \u201cScream\u201d and \u201cCrazy Snake\u201d await thrill-seekers. The '),
                  bold('Walhalla Goldfields Rail Trail'),
                  text(' winds through whispering forests with tranquil river views between Erica and Thomson stations.'),
                ]),
                h2('Winter'),
                p([
                  bold('Erica Ski Hire'),
                  text(' can kit you out with chains, skis, toboggans and snow play gear before you head up to '),
                  bold('Mt Baw Baw'),
                  text(' or '),
                  bold('Mt St Gwinear'),
                  text('. Erica is the last stop for supplies and gear hire on the way to the snow.'),
                ]),
                h2('More activities'),
                p([
                  text('The nearby '),
                  bold('Thomson River'),
                  text(' offers kayaking and white water rafting with low grade rapids. The surrounding bush is perfect for 4WD touring \u2014 South Face Road and Aberfeldy are popular routes.'),
                ]),
                h2('Accommodation'),
                p([
                  text('The '),
                  bold('Erica Hotel Motel'),
                  text(' has rooms, and the '),
                  bold('Erica Caravan Park'),
                  text(' has powered and unpowered sites. '),
                  bold('One Life Glamping'),
                  text(' offers luxury bell tents nearby. Airbnb options are also available.'),
                ]),
                h2('Getting here'),
                p([
                  text('Erica is on the Moe\u2013Rawson Road, about 30 minutes north of Moe. From Melbourne, take the M1 east to Moe then head north.'),
                ]),
                p([
                  bold('Fuel warning: '),
                  text('No petrol or diesel is available in Erica. Fill up before you leave Moe, Morwell or Traralgon.'),
                ]),
              ]),
            },
          ],
        },
        {
          blockType: 'mapEmbed',
          latitude: -38.024,
          longitude: 146.372,
          zoom: 13,
          caption: 'Erica, Victoria',
        },
      ],
    },
  })

  const aboutPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'About',
      slug: 'about',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: richText([
          { type: 'heading', tag: 'h1', children: [text('About Erica & Rawson')] },
        ]),
        links: [],
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText([
                p([
                  text('This site is a community resource for the townships of Erica and Rawson in Gippsland, Victoria, Australia.'),
                ]),
                h2('History'),
                p([
                  text('Rawson was established in 1977 for the workers building the '),
                  bold('Thomson Dam'),
                  text(', which was completed in 1983. The town was originally called Robertson (after Alan Robertson) before being renamed. The post office opened on 17 April 1979. When construction ended, the population crashed from ~1,800 to a few hundred and the entire town was auctioned off. The community that exists today was built by the workers and newcomers who bought up at auction and chose to stay.'),
                ]),
                p([
                  text('Erica has deeper roots, with genuinely old buildings still in daily use. The township sits at the foothills of Mt Baw Baw and has long served as a gateway to the high country.'),
                ]),
                h2('Living here'),
                p([
                  text('Rawson has a population of around 300 (2016 census). It sits within the '),
                  bold('Shire of Baw Baw'),
                  text(' in the state electorate of Narracan.'),
                ]),
                p([
                  text('The community has a surprising range of amenities for its size:'),
                ]),
                p([
                  bold('Education: '),
                  text('Rawson Primary School (established 1994, serving around 10 students from Rawson, Erica, Moondarra and surrounds) and kindergarten.'),
                ]),
                p([
                  bold('Health & Services: '),
                  text('Community Health Centre and Police Station.'),
                ]),
                p([
                  bold('Recreation: '),
                  text('Heated swimming pool, MTB and BMX tracks, Erica Mountain Bike Park (30+ km of trails), bushwalking, fishing, and proximity to Mt Baw Baw for snow sports.'),
                ]),
                p([
                  bold('Dining & Shopping: '),
                  text('General stores, cafes, country pubs, bottle shop, and Post Office.'),
                ]),
                p([
                  text('Housing is affordable and there are local jobs available, with more employment opportunities less than 30 minutes\u2019 drive away in Latrobe City and Baw Baw Shire.'),
                ]),
                h2('Activities in the region'),
                p([
                  text('The Mountain Rivers region attracts over 150,000 visitors each year for bushwalking, mountain biking, 4WD touring, trout fishing, white water rafting, cross-country skiing, gold fossicking, deer hunting, and trail riding.'),
                ]),
                h2('About this website'),
                p([
                  text('This site was created to revive and maintain a community web presence for Erica and Rawson. If you have information to contribute or corrections to suggest, we\u2019d love to hear from you.'),
                ]),
              ]),
            },
          ],
        },
      ],
    },
  })

  const drivingGuidePage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Getting Here',
      slug: 'getting-here',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: richText([
          { type: 'heading', tag: 'h1', children: [text('Getting Here')] },
          p([text('Four routes from Melbourne, plus everything you need to know about fuel, chains, and road conditions.')]),
        ]),
        links: [],
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText([
                p([
                  text('Erica and Rawson are roughly '),
                  bold('2\u20132.5 hours east of Melbourne'),
                  text(' in the Shire of Baw Baw. There are four main routes, each with a different character.'),
                ]),
                h2('Route 1: Via Moe (most common)'),
                p([
                  text('M1/Princes Freeway east to '),
                  bold('Moe'),
                  text(' (~1.5 hours), then north on the Moe\u2013Rawson Road through Erica to Rawson (~30\u201340 min). Fully sealed. This is the standard route and the one most GPS apps will suggest.'),
                ]),
                p([
                  bold('Last fuel: '),
                  text('Moe, Morwell, or Traralgon. There is no fuel in Erica or Rawson.'),
                ]),
                h2('Route 2: Tourist Road via Noojee'),
                p([
                  text('M1 to Drouin, then north through '),
                  bold('Noojee'),
                  text(' and over the mountain. ~2.5 hours. Sealed but winding mountain road \u2014 scenic and enjoyable in good conditions.'),
                ]),
                p([
                  bold('Last fuel: '),
                  text('Neerim South (24-hour).'),
                ]),
                h2('Route 3: South Face Road via Erica'),
                p([
                  text('M1 to Moe, then north through Erica. 95% sealed, but the '),
                  bold('last 30 km is unsealed dirt'),
                  text('. This route passes through beautiful mountain forest and is the main access road to Mt Baw Baw from the south. ~2.5 hours total.'),
                ]),
                p([
                  bold('Last fuel: '),
                  text('Moe.'),
                ]),
                h2('Route 4: Via Willow Grove'),
                p([
                  text('M1 to Trafalgar, then north via '),
                  bold('Blue Rock Lake'),
                  text(' and Willow Grove. ~3 hours. Sealed. A quieter alternative.'),
                ]),
                p([
                  bold('Last fuel: '),
                  text('Trafalgar or Moe.'),
                ]),
                h2('From the east'),
                p([
                  text('From Traralgon or Sale: head north-west via Tyers and the Thomson Valley Road to Rawson.'),
                ]),
                h2('From the north'),
                p([
                  text('From Mansfield or Eildon: access via Jamieson and the mountains. Check road conditions in winter \u2014 alpine roads may require chains and some tracks close June\u2013October.'),
                ]),
                h2('Fuel warning'),
                p([
                  bold('There is no petrol or diesel available in Erica or Rawson.'),
                  text(' Fill up before you leave. The nearest fuel is in Moe (37 km south), Morwell, Traralgon, or Neerim South.'),
                ]),
                h2('Winter driving & snow chains'),
                p([
                  bold('Chains are legally mandatory'),
                  text(' for all vehicles (including 4WD and AWD) during snow season on roads to Mt Baw Baw and Mt St Gwinear. You will be turned away without them.'),
                ]),
                p([
                  text('Chain hire is available at:'),
                ]),
                p([bold('Erica Ski Hire'), text(' \u2014 in Erica, on the way through')]),
                p([text('Noojee, Tanjil Bren, and Icy Creek also have chain hire outlets.')]),
                p([
                  text('South Face Road (the unsealed section) can be affected by snow and may be closed in severe conditions.'),
                ]),
                h2('Road conditions'),
                p([
                  text('Check conditions before you travel, especially in winter:'),
                ]),
                p([
                  bold('VicRoads: '),
                  text('traffic.vicroads.vic.gov.au'),
                ]),
                p([
                  bold('Mt Baw Baw resort: '),
                  text('mountbawbaw.com.au (road and snow reports)'),
                ]),
                p([
                  text('Many 4WD tracks in the surrounding national park close between June and October. Check Parks Victoria for current closures.'),
                ]),
              ]),
            },
          ],
        },
        {
          blockType: 'mapEmbed',
          latitude: -37.956389,
          longitude: 146.396944,
          zoom: 9,
          caption: 'Erica and Rawson in relation to Melbourne, Moe, and Mt Baw Baw',
        },
      ],
      meta: {
        title: 'Getting Here \u2014 Driving to Erica, Rawson & Mt Baw Baw',
        description: 'Four driving routes from Melbourne, fuel stops, chain hire, winter road conditions and everything you need to know before visiting Erica, Rawson and the Baw Baw region.',
      },
    },
  })

  // ── Places ──

  payload.logger.info(`— Seeding places...`)

  // Shopping
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Rawson Post Office and Mini Mart',
      slug: 'rawson-post-office-mini-mart',
      category: 'shopping',
      _status: 'published',
      summary: 'Post Office, General Store, take-away food, bottle shop, coffee, camping necessities and a range of local craft and food.',
      featuredImage: rawsonShopsImage.id,
      address: 'Rawson, VIC 3825',
      latitude: -37.956389,
      longitude: 146.396944,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Bric-a-Brac and Op-Shop',
      slug: 'bric-a-brac-op-shop',
      category: 'shopping',
      _status: 'published',
      summary: 'Bargains and collectables in a small country town. Clothing, kitchen gadgets, tools, books, CDs and more.',
      address: '1a Pinnacle Drive, Rawson, VIC 3825',
      latitude: -37.956389,
      longitude: 146.396944,
      hours: [
        { label: 'Wednesdays', times: '10:00 AM - 2:00 PM' },
        { label: 'Public Holidays', times: 'Usually open \u2014 check Facebook' },
      ],
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Ski Hire',
      slug: 'erica-ski-hire',
      category: 'shopping',
      _status: 'published',
      summary: 'Hire snow chains, skis, toboggans and other snow play gear for the winter season. Essential stop before heading to Mt Baw Baw or Mt St Gwinear.',
      address: 'Erica, VIC 3825',
    },
  })

  // Dining
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Hotel Motel',
      slug: 'erica-hotel-motel',
      category: 'dining',
      _status: 'published',
      summary: 'Historic country pub standing since 1915. Famous for the volcanic hot rock steak experience \u2014 cook your own steak on a sizzling rock at your table. Also home to a unique Bushman\u2019s Museum with a chainsaw collection.',
      address: 'Erica, VIC 3825',
      latitude: -38.0235,
      longitude: 146.3715,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Caf\u00e9 & Bar',
      slug: 'erica-cafe-bar',
      category: 'dining',
      _status: 'published',
      summary: 'Run by Bec, a welcoming local. Great coffee, cake, cocktails and country meals in the relaxed village of Erica. A favourite stop for trail riders and day-trippers alike.',
      address: 'Erica, VIC 3825',
      latitude: -38.024,
      longitude: 146.373,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Rawson Stockyard Bar & Bistro',
      slug: 'stockyard-hotel',
      category: 'dining',
      _status: 'published',
      summary: 'Large country meals in a rustic barn setting. A real bush pub experience in the heart of Rawson. Note: may operate seasonally \u2014 check before visiting.',
      address: 'Rawson, VIC 3825',
      latitude: -37.955,
      longitude: 146.398,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica General Store',
      slug: 'erica-general-store',
      category: 'dining',
      _status: 'published',
      summary: 'Great food in a country charm setting with genuinely old buildings still in use.',
      featuredImage: ericaTownImage.id,
      address: 'Erica, VIC 3825',
      latitude: -38.024,
      longitude: 146.372,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Assaggio del Forno',
      slug: 'assaggio-del-forno',
      category: 'dining',
      _status: 'published',
      summary: 'Woodfired pizza near Walhalla. A local favourite and well worth the trip. Open Sundays only.',
      address: 'Near Walhalla, VIC',
      hours: [
        { label: 'Sunday', times: '11:00 AM \u2013 7:30 PM' },
        { label: 'Mon\u2013Sat', times: 'Closed' },
      ],
    },
  })

  // Attractions
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Rawson Crater Lake',
      slug: 'rawson-crater-lake',
      category: 'attractions',
      _status: 'published',
      summary: 'A tranquil 500m lakeside loop walk among native bird and wildlife. A peaceful spot in the heart of Rawson.',
      address: 'Rawson, VIC 3825',
      latitude: -37.958,
      longitude: 146.393,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Mushroom Rocks Walk',
      slug: 'mushroom-rocks-walk',
      category: 'attractions',
      _status: 'published',
      summary: '3km return, 2 hours. Walk through rugged alpine landscape to a cluster of impressive granite tors rising from the forest bed.',
      address: 'Near Rawson, VIC 3825',
      latitude: -37.94,
      longitude: 146.41,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Thomson Dam',
      slug: 'thomson-dam',
      category: 'attractions',
      _status: 'published',
      summary: 'The dam that created Rawson. Completed in 1983, it\u2019s Melbourne\u2019s largest water storage. The surrounding area offers bushwalking and scenic views.',
      address: 'Thomson Valley, VIC',
      latitude: -37.875,
      longitude: 146.354,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Walhalla',
      slug: 'walhalla',
      category: 'attractions',
      _status: 'published',
      summary: 'Step back in time to this enchanting gold-rush heritage town. Explore old tramways, tour a gold mine, join a ghost tour, visit the cemetery, fire station museum, Olde Lolly Shoppe, and the Wally Pub.',
      address: 'Walhalla, VIC 3825',
      latitude: -37.937,
      longitude: 146.448,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Walhalla Goldfields Railway',
      slug: 'walhalla-goldfields-railway',
      category: 'attractions',
      _status: 'published',
      summary: 'A spectacular heritage railway ride meandering through Stringer\u2019s Gorge. A must-do for railway enthusiasts and visitors alike.',
      address: 'Walhalla, VIC 3825',
      latitude: -37.935,
      longitude: 146.449,
    },
  })

  // Activities
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Mountain Bike Park',
      slug: 'erica-mountain-bike-park',
      category: 'activities',
      _status: 'published',
      summary: '30+ kilometres of trails for all levels across two trailheads (Mill Park and Collins Siding). Trails include Crazy Snake, Bones, Axeman and Scream. Note: trail conditions and availability may vary \u2014 check Trailforks for current status before riding.',
      address: 'Erica, VIC 3825',
      latitude: -38.02,
      longitude: 146.37,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Thomson River \u2014 Kayaking & Rafting',
      slug: 'thomson-river-kayaking',
      category: 'activities',
      _status: 'published',
      summary: 'The Thomson River offers kayak and white water rafting opportunities with low grade rapids. Great for beginners and families.',
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Mt Baw Baw',
      slug: 'mt-baw-baw',
      category: 'activities',
      _status: 'published',
      summary: 'A eucalypt-fragrant alpine landscape. Skiing and boarding in winter, knuckle-whitening mountain biking and contemplative hikes in green season. Access via South Face Road from Erica.',
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Mt St Gwinear',
      slug: 'mt-st-gwinear',
      category: 'activities',
      _status: 'published',
      summary: 'An accessible snowfield on the Baw Baw Plateau with toboggan runs and areas for snow play. Perfect for families.',
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: '4WD Touring',
      slug: '4wd-touring',
      category: 'activities',
      _status: 'published',
      summary: 'Rugged mountainside begging to be explored by 4x4. South Face Road and Aberfeldy are popular routes. Tag-along tours available through Mountain Top Experience.',
    },
  })

  // Accommodation
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Mountain Rivers Tourist Park',
      slug: 'mountain-rivers-tourist-park',
      category: 'accommodation',
      _status: 'published',
      summary: 'Spa chalets, family chalets, alpine cabins, motel lodge, bunkhouse and campground with commanding views of the Mountain Rivers region.',
      address: 'Rawson, VIC 3825',
      phone: '(03) 5165 3231',
      website: 'https://www.mountainrivers.com.au/',
      latitude: -37.955,
      longitude: 146.395,
      hours: [
        { label: 'Mon\u2013Thu', times: '9am \u2013 5pm' },
        { label: 'Fri\u2013Sat', times: '9am \u2013 7:30pm' },
        { label: 'Sunday', times: 'By appointment' },
      ],
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Caravan Park',
      slug: 'erica-caravan-park',
      category: 'accommodation',
      _status: 'published',
      summary: 'Caravan and camping park in the heart of Erica, at the foothills of Mt Baw Baw. Powered and unpowered sites available.',
      address: 'Erica, VIC 3825',
      latitude: -38.023,
      longitude: 146.371,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Erica Hotel Motel \u2014 Accommodation',
      slug: 'erica-hotel-motel-accommodation',
      category: 'accommodation',
      _status: 'published',
      summary: 'Motel-style rooms at the Erica Hotel. Stay the night after a hearty pub meal and explore the region the next day.',
      address: 'Erica, VIC 3825',
      latitude: -38.0235,
      longitude: 146.3715,
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Airbnb & Holiday Rentals',
      slug: 'airbnb-holiday-rentals',
      category: 'accommodation',
      _status: 'published',
      summary: 'A number of private houses and cabins in and around Erica and Rawson are available on Airbnb, Stayz, and other holiday rental platforms. Search for Rawson, Erica, or Walhalla for options.',
      website: 'https://www.airbnb.com.au/s/Rawson--Victoria--Australia/',
    },
  })

  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'One Life Glamping',
      slug: 'one-life-glamping',
      category: 'accommodation',
      _status: 'published',
      summary: 'Luxury glamping experience in the Gippsland high country. Unique bell tents and safari-style accommodation surrounded by nature.',
      website: 'https://onelifeglamping.com.au/',
    },
  })

  // Services
  await payload.create({
    collection: 'places',
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      title: 'Rawson Primary School',
      slug: 'rawson-primary-school',
      category: 'services',
      _status: 'published',
      summary: 'Small rural school established in 1994, serving around 10 students from Rawson, Erica, Moondarra and surrounding districts.',
      address: 'Knotts Siding Rd, Rawson, VIC 3825',
      phone: '(03) 5165 3443',
      latitude: -37.955,
      longitude: 146.397,
    },
  })

  // ── Settings & Globals ──

  payload.logger.info(`— Seeding site settings...`)

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Erica and Rawson',
      tagline: 'Two Townships, One Community',
      description:
        'Erica and Rawson sit in the heart of Gippsland\u2019s Mountain Rivers Region. Your base for mountain biking, bushwalking, 4WD, skiing and exploring Walhalla in Victoria, Australia.',
    },
  })

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      context: { disableRevalidate: true },
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'Home',
              reference: { relationTo: 'pages', value: homePage.id },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Rawson',
              reference: { relationTo: 'pages', value: rawsonPage.id },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Erica',
              reference: { relationTo: 'pages', value: ericaPage.id },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Places',
              url: '/places',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Getting Here',
              reference: { relationTo: 'pages', value: drivingGuidePage.id },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: { relationTo: 'pages', value: aboutPage.id },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      context: { disableRevalidate: true },
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'Home',
              reference: { relationTo: 'pages', value: homePage.id },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Places',
              url: '/places',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Getting Here',
              reference: { relationTo: 'pages', value: drivingGuidePage.id },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: { relationTo: 'pages', value: aboutPage.id },
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

function readLocalFile(filename: string): File {
  const filePath = path.resolve(__dirname, filename)
  const data = fs.readFileSync(filePath)
  const ext = filename.split('.').pop() || 'jpg'
  return {
    name: filename,
    data: Buffer.from(data),
    mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    size: data.byteLength,
  }
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'EricaRawsonCMS/1.0 (community site seed script)',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()
  const filename = url.split('/').pop() || `file-${Date.now()}`
  const ext = filename.split('.').pop() || 'jpg'

  return {
    name: filename,
    data: Buffer.from(data),
    mimetype: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    size: data.byteLength,
  }
}
