use windows::core::{VARIANT, VARIANT_BOOL, ComInterface};
use windows::Win32::Media::DirectShow::{ICodecAPI, CODECAPI_AVEncCommonLowLatency};
use windows::Win32::System::Variant::VT_BOOL;

fn main() {
    let mut var = VARIANT::default();
    var.Anonymous.Anonymous.vt = VT_BOOL;
    var.Anonymous.Anonymous.Anonymous.boolVal = VARIANT_BOOL::from(true);
}

