= Image Frame jQuery plugin =
----------------------------------
== Purpose ==
This plugin was created to make it easy to add image-based frames (e.g. shadows or highlights) around any elements with full png transparency and full support for IE6.  That last bit is the kicker, since in IE6 transparent background images:
* Require a non-css-compliant filter (addressed by ifixpng plugin)
* cannot repeat
* can only be positioned in the top left of their boxes

Another problem with transparent images is that they get darker and darker as they are stacked.  These limitations mean we must use 8 images, non-stacked, one for each corner and side.

Some frame/shadow solutions wrap the item to be framed in multiple container elements, using floats and padding to place the backgrounds.  This plugin instead generates sibling nodes and uses absolute positioning to prevent issues with floats.  The CSS works in modern browsers (though with problems in IE7) without Javascript, meaning you could hard code the generated elements and it would work fine.  Javascript is mainly necessary for IE6, to get around problems with the handling of 100% dimensions in absolute boxes and to set transparency.  Several particular IE bugs are addressed in in the Javascript as well.  It should be robust in any design.

== Usage ==
See imageFrameTest.html for example usage and helpful test cases.

For initial setup, copy the CSS files and images into your project.  The CSS assumes the images are in a sibling directory called 'images', as they are in this package.  There is a separate stylesheet for IE6 - you should include it with conditional comments:

<!--[if lt IE 7]>
<link type="text/css" href="css/imageFrame_ie6.css" rel="stylesheet" />
<![endif]-->

Add references to jquery.imageFrame.js and jquery.ifixpng.js, and of course jQuery.

To create a frame around an element:
jQuery('img').imageFrame('sharp');
jQuery('img').imageFrame('soft');
jQuery('img').imageFrame(); //use default frame style

The default frame style is initially 'sharp'. To change it:
jQuery.imageFrame.defaultFrameStyle = 'soft';

== Frame Creation ==
I'm not a PhotoShop expert, so I created these frames from a raster design (created by a designer in PhotoShop) using GIMP. To create your own frames, use sample_frame_cut.psd as an example for the cut lines used to create frame_sharp.  Be sure to factor in the full size of the corners.  I simply used {Color / Color to Alpha} to create the transparent PNGs from the raster image.

After your cuts are made, you can use the styles for an existing frame as a template.  You will want to change the frame margin, frameBuffer padding, and individual dimensions and offsets to match the size of your images.  I would recommend putting your own frames in a separate stylesheet to make upgrades easier.

The final step is to add a new frameStyle to the list:
$.imageFrame.frameStyles['myFrame'] = {frameClass:'frameMyFrame'};
$('img').imageFrame('myFrame');

== Technical Notes ==
=== Limitations ===
I've tried to fix every issue that I've encountered, but some limitations remain.

* Repeating of transparent images is not possible in IE6, so frames can be a maximum of 1200x1200 (the size of the images).  Other browsers will repeat the edges, so there is no size limit.
* In IE, the size of the frame's side elements is set to a computed value, so text-size changes may break frames where text is included.
* Unfloated images will be treated as inline in Firefox 2-, so the frames will not fully enclose the image.
* Floating occasionally causes margin problems in IE6, such that text that flows around the framed item will go underneath it.  Most of the time increasing margins for those elements will fix the problem.

=== CSS Solution ===
Since one of the goals of this project is support of fully transparent frames, no elements in the frame can overlap, or stacking would cause the shading to combine.  To achieve this while still being flexible with the size of the target, the solution uses a combination of:
* 100% dimensions on the sides
* adjustments made for the corners using negative absolute positions, and
* overflow hidden to hide the internally overlapping boxes.

Thus, for each frame style, each side piece must adjust for the corner dimensions with a positive top: or left: on the outermost span, and and corresponding negative top: or left: on the inner span, which holds the actual background image for the side.

Note that by default the frames use negative margins to nullify the effect of the frame on layout.  That is, the frame should not affect the position of the contained element.  You can safely add overriding style rules that give the frame more margin.

=== Using the Generated Spans Without Javascript ===
The frames will not work well in IE6 without javascript, and IE7 has severe problems with some floats if Javascript is off.  If these problems do not affect you, you should be able to hard code the generated spans and the style will work.  It is useful to note that the "frameBuffer" span was added only to correct IE sizing bugs, and is not necessary for modern browsers.  You will have to adjust the CSS if you chose to remove that span though.
