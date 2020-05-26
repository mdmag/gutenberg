/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { resolveSelect, useSelect } from '@wordpress/data';
import { useEffect, useState, useCallback } from '@wordpress/element';
import {
	Tooltip,
	DropdownMenu,
	MenuGroup,
	MenuItemsChoice,
	MenuItem,
} from '@wordpress/components';
import { Icon, home, plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import AddTemplate from '../add-template';
import TemplatePreview from './template-preview';
import ThemePreview from './theme-preview';

/**
 * Browser dependencies
 */
const { fetch } = window;

function TemplateLabel( { template, homeId } ) {
	return (
		<>
			{ template.slug }{ ' ' }
			{ template.id === homeId && (
				<Tooltip text={ __( 'Home' ) }>
					<div className="edit-site-template-switcher__label-home-icon">
						<Icon icon={ home } />
					</div>
				</Tooltip>
			) }
			{ template.status !== 'auto-draft' && (
				<Tooltip text={ __( 'Customized' ) }>
					<span className="edit-site-template-switcher__label-customized-dot" />
				</Tooltip>
			) }
		</>
	);
}

export default function TemplateSwitcher( {
	ids,
	activeId,
	isTemplatePart,
	onActiveIdChange,
	onActiveTemplatePartIdChange,
	onAddTemplateId,
} ) {
	const [ hoveredTemplate, setHoveredTemplate ] = useState();
	const [ themePreviewVisible, setThemePreviewVisible ] = useState( false );

	const onHoverTemplate = ( id ) => {
		setHoveredTemplate( { id, type: 'template' } );
	};
	const onHoverTemplatePart = ( id ) => {
		setHoveredTemplate( { id, type: 'template-part' } );
	};

	const onMouseEnterTheme = () => {
		setThemePreviewVisible( () => true );
	};
	const onMouseLeaveTheme = () => {
		setThemePreviewVisible( () => false );
	};

	const [ homeId, setHomeId ] = useState();
	useEffect( () => {
		const effect = async () => {
			try {
				const { success, data } = await fetch(
					addQueryArgs( '/', { '_wp-find-template': true } )
				).then( ( res ) => res.json() );
				if ( success ) {
					let newHomeId = data.ID;
					if ( newHomeId === null ) {
						const { getEntityRecords } = resolveSelect( 'core' );
						newHomeId = await getEntityRecords(
							'postType',
							'wp_template',
							{
								resolved: true,
								slug: data.post_name,
							}
						)[ 0 ].id;
					}
					setHomeId( newHomeId );
				} else {
					throw new Error();
				}
			} catch ( err ) {
				setHomeId( null );
			}
		};
		effect();
	}, [] );

	const { currentTheme, templates, templateParts } = useSelect(
		( _select ) => {
			const { getCurrentTheme, getEntityRecords } = _select( 'core' );

			return {
				currentTheme: getCurrentTheme(),
				templates: getEntityRecords( 'postType', 'wp_template', {
					resolved: true,
				} )?.map( ( template ) => ( {
					label: (
						<TemplateLabel
							template={ template }
							homeId={ homeId }
						/>
					),
					value: template.id,
					slug: template.slug,
				} ) ),
				templateParts: getEntityRecords(
					'postType',
					'wp_template_part',
					{
						resolved: true,
						status: [ 'publish', 'auto-draft' ],
						theme: getCurrentTheme()?.stylesheet,
					}
				)?.map( ( templatePart ) => ( {
					label: <TemplateLabel template={ templatePart } />,
					value: templatePart.id,
					slug: templatePart.slug,
				} ) ),
			};
		}
	);
	const [ isAddTemplateOpen, setIsAddTemplateOpen ] = useState( false );
	return (
		<>
			<DropdownMenu
				popoverProps={ {
					className: 'edit-site-template-switcher__popover',
					position: 'bottom right',
				} }
				icon={ null }
				label={ __( 'Switch Template' ) }
				toggleProps={ {
					children: ( isTemplatePart
						? templateParts
						: templates
					)?.find( ( choice ) => choice.value === activeId ).slug,
				} }
			>
				{ ( { onClose } ) => (
					<>
						<MenuGroup label={ __( 'Templates' ) }>
							<MenuItemsChoice
								choices={ templates }
								value={
									! isTemplatePart ? activeId : undefined
								}
								onSelect={ onActiveIdChange }
								onHover={ onHoverTemplate }
							/>
							<MenuItem
								icon={ plus }
								onClick={ () => {
									onClose();
									setIsAddTemplateOpen( true );
								} }
							>
								{ __( 'New' ) }
							</MenuItem>
						</MenuGroup>
						<MenuGroup label={ __( 'Template Parts' ) }>
							<MenuItemsChoice
								choices={ templateParts }
								value={ isTemplatePart ? activeId : undefined }
								onSelect={ onActiveTemplatePartIdChange }
								onHover={ onHoverTemplatePart }
							/>
						</MenuGroup>
						<MenuGroup label={ __( 'Current theme' ) }>
							<MenuItem
								onMouseEnter={ onMouseEnterTheme }
								onMouseLeave={ onMouseLeaveTheme }
							>
								{ currentTheme.name }
							</MenuItem>
						</MenuGroup>
						{ !! hoveredTemplate?.id && (
							<TemplatePreview item={ hoveredTemplate } />
						) }
						{ themePreviewVisible && (
							<ThemePreview theme={ currentTheme } />
						) }
						<div className="edit-site-template-switcher__footer" />
					</>
				) }
			</DropdownMenu>
			<AddTemplate
				ids={ ids }
				onAddTemplateId={ onAddTemplateId }
				onRequestClose={ useCallback(
					() => setIsAddTemplateOpen( false ),
					[]
				) }
				isOpen={ isAddTemplateOpen }
			/>
		</>
	);
}
