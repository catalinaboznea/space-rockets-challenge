import React from 'react';
import { StarIcon } from '@chakra-ui/icons';
import { Badge, Box, Image, SimpleGrid, Text, Flex, IconButton } from '@chakra-ui/react';
import { format as timeAgo } from 'timeago.js';
import { Link } from 'react-router-dom';

import { useSpaceXPaginated } from '../utils/use-space-x';
import { formatDate } from '../utils/format-date';
import Error from './error';
import Breadcrumbs from './breadcrumbs';
import FavouritesDrawer from './favouritesDrawer';
import LoadMoreButton from './load-more-button';

const PAGE_SIZE = 12;

export default function Launches({ favouriteLaunches, markAsFavouriteLaunch }) {
	const { data, error, isValidating, setSize, size } = useSpaceXPaginated('/launches/past', {
		limit: PAGE_SIZE,
		order: 'desc',
		sort: 'launch_date_utc'
	});
	console.log(data, error);

	return (
		<div>
			<Box d="flex" alignItems="baseline">
				<Box width="85%">
					<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Launches' }]} />
				</Box>
				<FavouritesDrawer
					favouriteItems={favouriteLaunches}
					markAsFavourite={markAsFavouriteLaunch}
				/>
			</Box>
			<SimpleGrid m={[2, null, 6]} minChildWidth="350px" spacing="4">
				{error && <Error />}
				{data &&
					data
						.flat()
						.map(launch => (
							<LaunchItem
								launch={launch}
								key={launch.flight_number}
								favouriteLaunches={favouriteLaunches}
								markAsFavouriteLaunch={markAsFavouriteLaunch}
							/>
						))}
			</SimpleGrid>
			<LoadMoreButton
				loadMore={() => setSize(size + 1)}
				data={data}
				pageSize={PAGE_SIZE}
				isLoadingMore={isValidating}
			/>
		</div>
	);
}

export function LaunchItem({ launch, favouriteLaunches, markAsFavouriteLaunch }) {
	const isFavourite =
		(favouriteLaunches || []).findIndex(item => item.flight_number === launch.flight_number) > -1;

	return (
		<Box
			as={Link}
			to={`/launches/${launch.flight_number.toString()}`}
			boxShadow="md"
			borderWidth="1px"
			rounded="lg"
			overflow="hidden"
			position="relative"
		>
			<Image
				src={
					launch.links.flickr_images[0]?.replace('_o.jpg', '_z.jpg') ??
					launch.links.mission_patch_small
				}
				alt={`${launch.mission_name} launch`}
				height={['200px', null, '300px']}
				width="100%"
				objectFit="cover"
				objectPosition="bottom"
			/>

			<Image
				position="absolute"
				top="5"
				right="5"
				src={launch.links.mission_patch_small}
				height="75px"
				objectFit="contain"
				objectPosition="bottom"
			/>

			<Box p="6">
				<Box d="flex" alignItems="baseline">
					{launch.launch_success ? (
						<Badge px="2" variant="solid" colorScheme="green">
							Successful
						</Badge>
					) : (
						<Badge px="2" variant="solid" colorScheme="red">
							Failed
						</Badge>
					)}
					<Box
						color="gray.500"
						fontWeight="semibold"
						letterSpacing="wide"
						fontSize="xs"
						textTransform="uppercase"
						ml="2"
					>
						{launch.rocket.rocket_name} &bull; {launch.launch_site.site_name}
					</Box>
				</Box>
				<Box d="flex" alignItems="baseline">
					<Box width="90%" mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
						{launch.mission_name}
					</Box>
					<Box width="10%">
						<IconButton
							aria-label="Mark as favourite"
							icon={<StarIcon />}
							variant="ghost"
							colorScheme={isFavourite ? 'yellow' : 'gray'}
							onClick={e => markAsFavouriteLaunch(launch, e)}
						/>
					</Box>
				</Box>
				<Flex>
					<Text fontSize="sm">{formatDate(launch.launch_date_utc)} </Text>
					<Text color="gray.500" ml="2" fontSize="sm">
						{timeAgo(launch.launch_date_utc)}
					</Text>
				</Flex>
			</Box>
		</Box>
	);
}
